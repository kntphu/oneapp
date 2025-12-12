// src/pages/LogsPage.tsx

import React, { useState, useMemo, useCallback, useTransition, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FaHistory, FaSearch, FaUser, FaGlobe, FaCheck, FaTimes, 
    FaEdit, FaSignInAlt, FaSignOutAlt, FaSpinner, FaBell, FaTimesCircle
} from 'react-icons/fa';

import { fetchLogs, fetchEvents } from '@api/ApiCollection';
import { CACHE_CONFIG } from '@/config';
import { useResponsive } from '@utils/hooks/useResponsive';
import Pagination from '@components/common/Pagination';
import SkeletonLoader from '@components/common/SkeletonLoader';
import { showErrorToast } from '@utils/toastUtils';
import { CustomDatePicker } from '@components/common/CustomDatePicker';

// ===================================================================
//                        INTERFACE & TYPE DEFINITIONS
// ===================================================================

interface LogEntry {
    id: number;
    user_login: string;
    fullname: string;
    login_date: string;
    ip_address: string;
    action: string;
}

interface EventEntry {
    id: number;
    event_timestamp: string;
    event_ipaddress: string;
    event_firstname: string | null;
    event_idcard: string;
    event_message: string;
}

interface BaseEntry {
    id: number;
    [key: string]: any; 
}

interface ColumnDef<T extends BaseEntry> {
    header: string;
    accessor: (item: T) => React.ReactNode;
}

interface LogDisplayTabProps<T extends BaseEntry> {
    queryKey: string;
    fetchFn: () => Promise<T[]>;
    columns: ColumnDef<T>[];
    renderMobileCard: (item: T) => React.ReactNode;
    dateKey: keyof T;
    itemName: string;
}

// ===================================================================
//                        GENERIC TAB COMPONENT
// ===================================================================

function LogDisplayTabContent<T extends BaseEntry>({
    queryKey, fetchFn, columns, renderMobileCard, dateKey, itemName
}: LogDisplayTabProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterDate, setFilterDate] = useState<string>('');
    const [isPending, startTransition] = useTransition();

    const itemsPerPage = 15;
    const { isMobile } = useResponsive();

    const { data, isLoading, isError, error } = useQuery<T[]>({
        queryKey: [queryKey],
        queryFn: fetchFn,
        staleTime: CACHE_CONFIG.staleTime.short,
    });

    const filteredData = useMemo(() => {
        if (!data) return [];
        let filtered = [...data];
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(searchLower)));
        }
        if (filterDate) {
            filtered = filtered.filter(item => new Date(item[dateKey] as string).toISOString().split('T')[0] === filterDate);
        }
        return filtered.sort((a, b) => new Date(b[dateKey] as string).getTime() - new Date(a[dateKey] as string).getTime());
    }, [data, searchTerm, filterDate, dateKey]);

    const { paginatedData, totalPages } = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filteredData.slice(startIndex, startIndex + itemsPerPage);
        const pages = Math.ceil(filteredData.length / itemsPerPage);
        return { paginatedData: paginated, totalPages: pages > 0 ? pages : 1 };
    }, [filteredData, currentPage, itemsPerPage]);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => startTransition(() => { setSearchTerm(e.target.value); setCurrentPage(1); });
    const handleFilterDateChange = (date: string) => { setFilterDate(date); setCurrentPage(1); };
    const handleClearFilters = () => { setSearchTerm(''); setFilterDate(''); setCurrentPage(1); };
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (isError) {
        showErrorToast(`ไม่สามารถโหลดข้อมูลได้: ${(error as Error)?.message}`);
        return (
            <div className="p-6 text-center bg-red-50 text-red-700 rounded-lg"><FaTimesCircle className="mx-auto h-12 w-12 mb-4" /><h3 className="text-lg font-medium">เกิดข้อผิดพลาด</h3><p>ไม่สามารถโหลดข้อมูลได้</p></div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={handleSearchChange} className="form-input pl-10" />{isPending && <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}</div>
                <CustomDatePicker value={filterDate} onChange={handleFilterDateChange} />
                <button onClick={handleClearFilters} className="btn-secondary-outline">ล้างตัวกรอง</button>
            </div>

            {isLoading ? (
                isMobile ? <SkeletonLoader type="card" count={5} className="space-y-4" /> : <SkeletonLoader type="table" count={10} />
            ) : (
                <>
                    <div className="hidden md:block">
                        <div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full text-sm text-left text-gray-600"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>{columns.map(col => <th key={col.header} className="px-6 py-3">{col.header}</th>)}</tr></thead><tbody>{paginatedData.map(item => (<tr key={item.id} className="bg-white border-b hover:bg-gray-50">{columns.map(col => <td key={col.header} className="px-6 py-4">{col.accessor(item)}</td>)}</tr>))}</tbody></table></div>
                    </div>
                    <div className="md:hidden space-y-4">
                        {paginatedData.map(item => <div key={item.id}>{renderMobileCard(item)}</div>)}
                    </div>
                </>
            )}

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} itemsCount={paginatedData.length} totalItems={filteredData.length} itemName={itemName} />}
        </div>
    );
};
const LogDisplayTab = memo(LogDisplayTabContent) as <T extends BaseEntry>(props: LogDisplayTabProps<T>) => React.ReactElement;

// ===================================================================
//                        LOGS PAGE COMPONENT
// ===================================================================

const LogsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logs' | 'events'>('logs');

    const tabs = useMemo(() => [
        { id: 'logs', label: 'ประวัติการใช้งาน', icon: FaHistory },
        { id: 'events', label: 'ประวัติเหตุการณ์', icon: FaBell },
    ], []);
    
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return { date: date.toLocaleDateString('th-TH'), time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    }, []);
    
    const getActionInfo = useCallback((action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('login') && actionLower.includes('success')) return { icon: <FaSignInAlt />, className: 'text-success bg-green-100' };
        if (actionLower.includes('logout')) return { icon: <FaSignOutAlt />, className: 'text-blue-500 bg-blue-100' };
        if (actionLower.includes('login') && actionLower.includes('failed')) return { icon: <FaTimes />, className: 'text-red-500 bg-red-100' };
        if (actionLower.includes('edit') || actionLower.includes('update')) return { icon: <FaEdit />, className: 'text-orange-500 bg-orange-100' };
        return { icon: <FaCheck />, className: 'text-gray-500 bg-gray-100' };
    }, []);

    const logColumns = useMemo((): ColumnDef<LogEntry>[] => [
        { header: 'ID', accessor: item => <span className="font-medium text-gray-900">{item.id}</span> },
        { header: 'อีเมล', accessor: item => <div className="flex items-center gap-2"><FaUser className="text-gray-400" /><span className="text-gray-900">{item.user_login}</span></div> },
        { header: 'ชื่อ - นามสกุล', accessor: item => <span className="text-gray-900">{item.fullname}</span> },
        { header: 'วันที่ / เวลา', accessor: item => { const dt = formatDate(item.login_date); return <div className="flex flex-col"><span className="font-medium text-gray-800">{dt.date}</span><span className="text-xs text-gray-500">{dt.time}</span></div> }},
        { header: 'ไอพี แอดเดรส', accessor: item => <div className="flex items-center gap-2"><FaGlobe className="text-gray-400" /><span className="font-mono text-xs text-purple-600">{item.ip_address}</span></div> },
        { header: 'กิจกรรม', accessor: item => { const info = getActionInfo(item.action); return <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${info.className}`}>{info.icon} {item.action}</span>}},
    ], [formatDate, getActionInfo]);

    const eventColumns = useMemo((): ColumnDef<EventEntry>[] => [
        { header: 'ชื่อผู้จอง', accessor: item => <div className="flex items-center gap-2"><FaUser className="text-gray-400" /><span className="text-gray-900">{item.event_firstname || '-'}</span></div> },
        { header: 'เลขประจำตัว', accessor: item => <span className="text-gray-900">{item.event_idcard}</span> },
        { header: 'วันที่ / เวลา', accessor: item => { const dt = formatDate(item.event_timestamp); return <div className="flex flex-col"><span className="font-medium text-gray-800">{dt.date}</span><span className="text-xs text-gray-500">{dt.time}</span></div> }},
        { header: 'ไอพี แอดเดรส', accessor: item => <div className="flex items-center gap-2"><FaGlobe className="text-gray-400" /><span className="font-mono text-xs text-purple-600">{item.event_ipaddress}</span></div> },
        { header: 'ข้อความที่ได้รับมาจากเซิฟเวอร์', accessor: item => {
            const message = item.event_message;
            let colorClass = 'text-gray-600';
            if (message.includes('ไม่สามารถจองเลขทะเบียน')) {
                colorClass = 'text-red-600 font-medium';
            } else if (message.includes('ตรวจสอบผลการจอง')) {
                colorClass = 'text-green-600 font-medium';
            }
            return <span className={`whitespace-normal break-words ${colorClass}`}>{message}</span>;
        }},
    ], [formatDate]);

    const renderLogMobileCard = useCallback((log: LogEntry) => {
        const { date, time } = formatDate(log.login_date);
        const actionInfo = getActionInfo(log.action);
        return (
            <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"><div className="flex items-start justify-between mb-3"><div><div className="font-medium text-gray-900">{log.fullname}</div><div className="text-sm text-gray-500">ID: {log.id}</div></div><span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${actionInfo.className}`}>{actionInfo.icon} {log.action}</span></div><div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-gray-100"><div><p className="text-gray-500">ผู้ใช้งาน</p><p className="font-medium text-gray-800">{log.user_login}</p></div><div><p className="text-gray-500">IP Address</p><p className="font-mono text-purple-600">{log.ip_address}</p></div><div className="col-span-2"><p className="text-gray-500">วันที่และเวลา</p><p className="font-medium text-gray-800">{date} {time}</p></div></div></div>
        );
    }, [formatDate, getActionInfo]);

    const renderEventMobileCard = useCallback((event: EventEntry) => {
        const { date, time } = formatDate(event.event_timestamp);
        const message = event.event_message;
        let colorClass = 'text-gray-800';
        if (message.includes('ไม่สามารถจองเลขทะเบียน')) {
            colorClass = 'text-red-600';
        } else if (message.includes('ตรวจสอบผลการจอง')) {
            colorClass = 'text-green-600';
        }
        return (
            <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-3"><div className="flex items-start justify-between"><p className={`font-semibold break-all ${colorClass}`}>{event.event_message}</p><span className="text-xs text-gray-500 font-mono flex-shrink-0 ml-2">ID: {event.id}</span></div><div className="text-xs text-gray-600 space-y-1 border-t border-gray-100 pt-3"><p><strong>ชื่อเต็ม:</strong> <span className="text-gray-900">{event.event_firstname || '-'}</span></p><p><strong>เลขประจำตัว:</strong> <span className="text-gray-900">{event.event_idcard}</span></p><p><strong>วันที่:</strong> {date} {time}</p><p><strong>IP:</strong> <span className="text-purple-600">{event.event_ipaddress}</span></p></div></div>
        );
    }, [formatDate]);
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><FaHistory className="h-5 w-5 text-purple-600" /></div><div><h2 className="text-xl font-bold font-sans text-gray-900">ประวัติทั้งหมด</h2><p className="text-sm text-gray-500">ประวัติการใช้งานและเหตุการณ์ต่างๆ ในระบบ</p></div></div></div>
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-2"><div className="flex space-x-2">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>))}</div></div>
            <div className="bg-white rounded-xl shadow-card border border-gray-100 min-h-[400px]">
                {activeTab === 'logs' && <LogDisplayTab<LogEntry> key="logs" queryKey="logs" fetchFn={fetchLogs} columns={logColumns} renderMobileCard={renderLogMobileCard} dateKey="login_date" itemName="ประวัติ" />}
                {activeTab === 'events' && <LogDisplayTab<EventEntry> key="events" queryKey="events" fetchFn={fetchEvents} columns={eventColumns} renderMobileCard={renderEventMobileCard} dateKey="event_timestamp" itemName="เหตุการณ์" />}
            </div>
        </div>
    );
};

export default LogsPage;