// src/pages/Home.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaCar, FaMotorcycle, FaDollarSign, FaCalendarAlt,
  FaChartLine, FaArrowUp, FaArrowDown, FaClock, FaPlus,
  FaChartPie, FaChartBar, FaCalculator, FaCogs, FaChartArea,
} from 'react-icons/fa';
import { useAuth } from '@context/AuthContext';
import { CACHE_CONFIG } from '@/config';
import {
  fetchTotalCustomer, fetchTotalVehicle, fetchTotalMoto,
  fetchTotalAmount, fetchCustomerStatus, fetchMonthlyRevenue,
  fetchTotalRevenueByCarType, fetchTotalProfit,
} from '@api/ApiCollection';
import ChartBox from '@components/ChartBox';
import CalendarHome from '@components/CalendarHome';
import CustomerFormModal from '@components/CustomerFormModal';
import SkeletonLoader from '@components/common/SkeletonLoader';
import { formatFullDateTime } from '@utils/formatters';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

// ===================================================================
//                        SUB-COMPONENTS
// ===================================================================

/**
 * Component ส่วนหัวสำหรับแสดงข้อความต้อนรับและเวลาปัจจุบัน
 */
const WelcomeHeader: React.FC<{ user: any; currentTime: Date }> = React.memo(({ user, currentTime }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold font-sans text-gray-900 mb-2">ยินดีต้อนรับสู่ One Platform</h1>
        <p className="text-gray-600">สวัสดี คุณ{user?.firstName} {user?.lastName} 👋</p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-1"><FaClock /><span>{formatFullDateTime(currentTime)}</span></div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium"><div className="w-2 h-2 bg-success rounded-full animate-pulse"></div><span>ออนไลน์</span></div>
      </div>
    </div>
  </div>
));
WelcomeHeader.displayName = 'WelcomeHeader';

/**
 * Component การ์ดแสดงผลสถิติ
 */
const StatCard: React.FC<{ stat: StatCardData; index: number }> = React.memo(({ stat, index }) => (
  <div
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 opacity-0 animate-slide-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        {stat.change && (
          <div className="flex items-center gap-1 text-sm mt-1">
            {stat.changeType === 'increase' ? <FaArrowUp className="w-3 h-3 text-success" /> : <FaArrowDown className="w-3 h-3 text-error" />}
            <span className={`${stat.changeType === 'increase' ? 'text-success' : 'text-error'} font-medium`}>{stat.change}</span>
            <span className="text-xs text-gray-500">จากเดือนที่แล้ว</span>
          </div>
        )}
      </div>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

/**
 * Component สำหรับแสดงกลุ่มของการ์ดสถิติ
 */
const StatCards: React.FC<{ stats: StatCardData[]; isLoading: boolean }> = React.memo(({ stats, isLoading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {isLoading ? (
      <SkeletonLoader type="stat-card" count={4} className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" />
    ) : (
      stats.map((stat, index) => <StatCard key={stat.title} stat={stat} index={index} />)
    )}
  </div>
));
StatCards.displayName = 'StatCards';

/**
 * Component สำหรับแสดงกลุ่มของกราฟ
 */
const ChartsGrid: React.FC<{
  revenueByCarTypeData: any; loadingRevenueByCarType: boolean;
  customerStatusData: any; loadingStatus: boolean;
  totalProfitData: any; loadingProfit: boolean;
  monthlyRevenueData: any; loadingRevenue: boolean;
}> = React.memo(({ revenueByCarTypeData, loadingRevenueByCarType, customerStatusData, loadingStatus, totalProfitData, loadingProfit, monthlyRevenueData, loadingRevenue }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px]"><ChartBox chartType="area" title="รายได้แยกตามประเภทรถ" IconBox={FaChartArea} showIcon={true} chartAreaData={revenueByCarTypeData?.chartAreaData || []} isLoading={loadingRevenueByCarType} /></div>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px]"><ChartBox chartType="pie" title="สถานะการจอง" IconBox={FaChartPie} showIcon={true} chartPieData={customerStatusData || []} isLoading={loadingStatus} /></div>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px]"><ChartBox chartType="line" title="สรุปยอดแยกตามรายวัน" IconBox={FaChartLine} showIcon={true} dataKey="profit" chartData={totalProfitData?.chartData || []} isLoading={loadingProfit} /></div>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px]"><ChartBox chartType="bar" title="สรุปยอดแยกตามรายเดือน" IconBox={FaChartBar} showIcon={true} dataKey="earning" chartData={monthlyRevenueData || []} isLoading={loadingRevenue} /></div>
  </div>
));
ChartsGrid.displayName = 'ChartsGrid';

/**
 * Component สำหรับแสดงส่วน Quick Actions
 */
const QuickActions: React.FC<{ actions: QuickAction[] }> = React.memo(({ actions }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"><FaChartLine className="w-4 h-4 text-primary-dark" /></div>
      <h2 className="text-xl font-semibold text-gray-900">การดำเนินการด่วน</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={action.title}
          onClick={action.action}
          className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 text-left opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 group-hover:text-primary-dark transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
));
QuickActions.displayName = 'QuickActions';

// ===================================================================
//                        MAIN HOME COMPONENT
// ===================================================================

/**
 * Component หน้าหลัก (Dashboard) ของแอปพลิเคชัน
 */
const Home: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: totalCustomer, isLoading: loadingCustomer } = useQuery({ queryKey: ['totalCustomer'], queryFn: fetchTotalCustomer, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: totalVehicle, isLoading: loadingVehicle } = useQuery({ queryKey: ['totalVehicle'], queryFn: fetchTotalVehicle, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: totalMoto, isLoading: loadingMoto } = useQuery({ queryKey: ['totalMoto'], queryFn: fetchTotalMoto, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: totalAmount, isLoading: loadingAmount } = useQuery({ queryKey: ['totalAmount'], queryFn: fetchTotalAmount, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: customerStatusData, isLoading: loadingStatus } = useQuery({ queryKey: ['customerStatus'], queryFn: fetchCustomerStatus, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: monthlyRevenueData, isLoading: loadingRevenue } = useQuery({ queryKey: ['monthlyRevenue'], queryFn: fetchMonthlyRevenue, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: revenueByCarTypeData, isLoading: loadingRevenueByCarType } = useQuery({ queryKey: ['revenueByCarType'], queryFn: fetchTotalRevenueByCarType, staleTime: CACHE_CONFIG.staleTime.medium });
  const { data: totalProfitData, isLoading: loadingProfit } = useQuery({ queryKey: ['totalProfit'], queryFn: fetchTotalProfit, staleTime: CACHE_CONFIG.staleTime.medium });

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const statCards: StatCardData[] = useMemo(() => [
    { title: 'ลูกค้าทั้งหมด', value: totalCustomer?.totalCustomers || 0, change: `${totalCustomer?.percentageChange ?? 0}%`, changeType: (totalCustomer?.percentageChange ?? 0) >= 0 ? 'increase' : 'decrease', icon: FaUsers, color: 'text-primary-dark', bgColor: 'bg-primary/10' },
    { title: 'รถยนต์', value: totalVehicle?.totalVehicles || 0, change: `${totalVehicle?.percentageChange ?? 0}%`, changeType: (totalVehicle?.percentageChange ?? 0) >= 0 ? 'increase' : 'decrease', icon: FaCar, color: 'text-info', bgColor: 'bg-info/10' },
    { title: 'รถจักรยานยนต์', value: totalMoto?.totalMoto || 0, change: `${totalMoto?.percentageChange ?? 0}%`, changeType: (totalMoto?.percentageChange ?? 0) >= 0 ? 'increase' : 'decrease', icon: FaMotorcycle, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'รายได้รวม', value: `฿${Number(totalAmount?.currentMonthAmount || 0).toLocaleString()}`, change: `${totalAmount?.percentageChange ?? 0}%`, changeType: (totalAmount?.percentageChange ?? 0) >= 0 ? 'increase' : 'decrease', icon: FaDollarSign, color: 'text-success', bgColor: 'bg-success/10' }
  ], [totalCustomer, totalVehicle, totalMoto, totalAmount]);

  const quickActions: QuickAction[] = useMemo(() => [
    { title: 'เพิ่มลูกค้าใหม่', description: 'เพิ่มข้อมูลลูกค้าและการจองใหม่', icon: FaPlus, color: 'bg-primary', action: handleOpenModal },
    { title: 'ดูปฏิทิน', description: 'ตรวจสอบการนัดหมายวันนี้', icon: FaCalendarAlt, color: 'bg-info', action: () => navigate('/calendar') },
    { title: 'ทะเบียนรถ', description: 'คำนวณและตรวจสอบข้อมูล', icon: FaCalculator, color: 'bg-purple-500', action: () => navigate('/plates-info') },
    { title: 'ตั้งค่า', description: 'ตั้งค่าระบบและการใช้งาน', icon: FaCogs, color: 'bg-success', action: () => navigate('/settings') }
  ], [handleOpenModal, navigate]);

  return (
    <>
      <CustomerFormModal isOpen={isModalOpen} onClose={handleCloseModal} mode="add"/>
      <div className="space-y-8 animate-fade-in">
        <WelcomeHeader user={user} currentTime={currentTime} />
        <StatCards stats={statCards} isLoading={loadingCustomer || loadingVehicle || loadingMoto || loadingAmount} />
        
        <CalendarHome /> 

        <ChartsGrid
          revenueByCarTypeData={revenueByCarTypeData} loadingRevenueByCarType={loadingRevenueByCarType}
          customerStatusData={customerStatusData} loadingStatus={loadingStatus}
          totalProfitData={totalProfitData} loadingProfit={loadingProfit}
          monthlyRevenueData={monthlyRevenueData} loadingRevenue={loadingRevenue}
        />
        <QuickActions actions={quickActions} />
      </div>
    </>
  );
};

export default Home;