// src/components/ChartBox.tsx

import React, { useMemo } from 'react';
import type { IconType } from 'react-icons';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import {
  BarChart, PieChart, AreaChart, Bar, Pie, Area, Cell, XAxis,
  YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import type { PieChartData, AreaChartData, BarChartData } from '@api/types';
import CarTypeIcon from '@/components/common/CarTypeIcon';
import SkeletonLoader from '@components/common/SkeletonLoader';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface ChartBoxProps {
  chartType: 'line' | 'bar' | 'area' | 'pie';
  IconBox?: IconType;
  title?: string;
  dataKey?: string;
  chartData?: BarChartData[];
  chartPieData?: PieChartData[];
  chartAreaData?: AreaChartData[];
  isLoading?: boolean;
  className?: string;
  showIcon?: boolean;
}

// ===================================================================
//                        MAIN CHARTBOX COMPONENT
// ===================================================================

/**
 * Component Chart
 */
const ChartBox: React.FC<ChartBoxProps> = ({
  chartType,
  IconBox,
  title,
  dataKey,
  chartData,
  chartPieData,
  chartAreaData,
  isLoading = false,
  className = '',
  showIcon = false,
}) => {

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 flex flex-col items-start gap-4">
        <SkeletonLoader type="card" count={1} />
      </div>
    );
  }

  // --- BAR CHART & LINE CHART ---
  if (chartType === 'line' || chartType === 'bar') {
    const isLineChart = chartType === 'line';
    const dayColors: { [key: string]: string } = { 'จ': '#F59E0B', 'อ': '#EC4899', 'พ': '#10B981', 'พฤ': '#F97316', 'ศ': '#3B82F6', 'ส': '#8B5CF6', 'อา': '#EF4444' };
    const barColors = ['#FF6B9D', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#EF4444', '#06B6D4', '#84CC16', '#EC4899', '#6366F1', '#F59E0B'];
    const fullDayNames: { [key: string]: string } = { 'จ': 'จันทร์', 'อ': 'อังคาร', 'พ': 'พุธ', 'พฤ': 'พฤหัสบดี', 'ศ': 'ศุกร์', 'ส': 'เสาร์', 'อา': 'อาทิตย์' };

    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {showIcon && IconBox && <IconBox className={`w-5 h-5 ${isLineChart ? 'text-green-600' : 'text-blue-600'}`} />}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="w-full flex-grow min-h-[350px]">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value: any) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length && label) {
                      const strLabel = String(label);
                      const displayName = isLineChart ? (fullDayNames[strLabel] || strLabel) : strLabel;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{displayName}</p>
                          <p className="text-sm text-gray-600" style={isLineChart ? {} : {color: payload[0].color}}>ยอดจอง: ฿{payload[0]?.value?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey={dataKey || (isLineChart ? 'profit' : 'earning')} radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isLineChart ? (dayColors[entry.name as keyof typeof dayColors] || '#6B7280') : barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">ไม่มีข้อมูล</div>
          )}
        </div>
      </div>
    );
  }

  // --- PIE CHART ---
  if (chartType === 'pie') {
    const totalValue = useMemo(() => chartPieData?.reduce((sum, entry) => sum + entry.value, 0) || 0, [chartPieData]);
    
    const getStatusIcon = (statusName: string): IconType => {
        const name = statusName.toLowerCase();
        if (name.includes('สำเร็จ')) return FiCheckCircle;
        if (name.includes('รอ')) return FiClock;
        if (name.includes('ยกเลิก')) return FiXCircle;
        return FiAlertCircle;
    };
    
    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="mb-4">
          <div className="flex items-center gap-3">{showIcon && IconBox && <IconBox className="w-5 h-5 text-green-600" />}<h3 className="text-xl font-bold text-gray-900">{title}</h3></div>
        </div>
        <div className="w-full flex-grow min-h-[240px] relative">
          {chartPieData && chartPieData.length > 0 ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center z-0"><div className="text-center"><span className="text-3xl font-bold text-gray-800">{totalValue.toLocaleString()}</span><p className="text-sm text-gray-500">ทั้งหมด</p></div></div>
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartPieData} cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" paddingAngle={4} dataKey="value" cornerRadius={8}>{chartPieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}</Pie></PieChart></ResponsiveContainer>
            </>
          ) : <div className="flex items-center justify-center h-full text-gray-500">ไม่มีข้อมูล</div>}
        </div>
        {chartPieData && chartPieData.length > 0 && (
          <div className="mt-auto pt-4">
            <div className="flex flex-row flex-wrap justify-center items-center gap-x-6 gap-y-4 mt-6">
              {chartPieData.map((entry, index) => {
                 const StatusIcon = getStatusIcon(entry.name);
                 return (<div key={`item-${index}`} className="flex items-center gap-2 min-w-0"><StatusIcon className="w-5 h-5 flex-shrink-0" style={{ color: entry.color }} /><div className="flex flex-col truncate"><span className="text-sm font-medium text-gray-800 truncate" title={entry.name}>{entry.name}</span><span className="text-xs text-gray-500">{entry.value.toLocaleString()} รายการ</span></div></div>)
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- AREA CHART ---
  if (chartType === 'area') {
    const carTypeColors = { CAR: '#3B82F6', MC: '#8B5CF6', TRUCK: '#10B981', VAN: '#F97316' };
    const carTypeDisplayNames: { [key: string]: string } = { 'CAR': 'รถเก๋ง', 'VAN': 'รถตู้', 'TRUCK': 'รถกระบะ', 'MC': 'มอเตอร์ไซค์' };

    return (
      <div className={`w-full h-full flex flex-col ${className}`}>
        <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-3">{showIcon && IconBox && <IconBox className="w-5 h-5 text-purple-600" />}<h3 className="text-xl font-bold text-gray-900">{title}</h3></div></div>
        <div className="w-full flex-grow min-h-[350px]">
          {chartAreaData && chartAreaData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartAreaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value: any) => `${(value / 1000).toFixed(0)}k`} /><Tooltip content={({ active, payload, label }) => active && payload?.length ? (<div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200"><p className="text-sm font-medium text-gray-900 mb-3">{label}</p>{payload.map((entry: any) => (<div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} /><span className="text-sm text-gray-700">{carTypeDisplayNames[entry.dataKey] || entry.dataKey}</span></div><span className="text-sm font-medium text-gray-900">฿{entry.value?.toLocaleString()}</span></div>))}<div className="border-t border-gray-200 pt-2 mt-2"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900">รวมทั้งหมด:</span><span className="text-sm font-bold text-orange-600">฿{payload.reduce((sum, entry) => sum + (entry.value || 0), 0).toLocaleString()}</span></div></div></div>) : null} /><Legend content={(props) => (<div className="flex justify-center items-center gap-3 md:gap-6 mt-4 flex-wrap px-2">{props.payload?.map((entry: any) => (<div key={entry.value} className="flex items-center gap-2 min-w-0"><CarTypeIcon type={entry.value} size="sm" showTooltip={false} /><span className="text-xs md:text-sm font-medium text-gray-700 truncate">{carTypeDisplayNames[entry.value] || entry.value}</span></div>))}</div>)} /><Area type="monotone" dataKey="CAR" stackId="1" stroke={carTypeColors.CAR} fill={carTypeColors.CAR} fillOpacity={0.6} strokeWidth={2} /><Area type="monotone" dataKey="VAN" stackId="1" stroke={carTypeColors.VAN} fill={carTypeColors.VAN} fillOpacity={0.6} strokeWidth={2} /><Area type="monotone" dataKey="TRUCK" stackId="1" stroke={carTypeColors.TRUCK} fill={carTypeColors.TRUCK} fillOpacity={0.6} strokeWidth={2} /><Area type="monotone" dataKey="MC" stackId="1" stroke={carTypeColors.MC} fill={carTypeColors.MC} fillOpacity={0.6} strokeWidth={2} /></AreaChart></ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-full text-gray-500">ไม่มีข้อมูล</div>}
        </div>
      </div>
    );
  }

  return null;
};

export default ChartBox;