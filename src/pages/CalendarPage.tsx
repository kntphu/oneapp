// src/pages/CalendarPage.tsx

import React, { useState, useMemo, useCallback, memo } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';

import CustomerFormModal from '@components/CustomerFormModal';
import { useCalendar } from '@utils/hooks/useCalendar';
import { formatDate, getStatusColor } from '@utils/formatters';

// ===================================================================
//                        INTERFACE & TYPE DEFINITIONS
// ===================================================================

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  details: string;
  status: string;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

const CalendarSidebar: React.FC<{ 
  events: CalendarEvent[]; 
  isLoading: boolean;
  onEventClick: (event: CalendarEvent) => void;
}> = memo(({ events, isLoading, onEventClick }) => {
  const EventSkeleton = useMemo(() => (
    Array.from({ length: 7 }).map((_, i) => (
      <div key={`skeleton-${i}`} className="p-3 rounded-lg bg-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    ))
  ), []);

  return (
    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
      <h3 className="text-lg font-bold font-sans text-gray-900 mb-4">กำหนดการล่าสุด</h3>
      <div className="space-y-4">
        {isLoading && EventSkeleton}
        {!isLoading && events.length > 0 ? (
          events.slice(0, 7).map(event => (
            <button key={`event-${event.id}`} onClick={() => onEventClick(event)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <p className="font-semibold text-sm text-gray-800">{formatDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-sm text-gray-600 truncate">{event.title}</p>
              <p className="text-xs text-gray-500 truncate">{event.details}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></div>
                <span className="text-xs text-gray-500 capitalize">{event.status}</span>
              </div>
            </button>
          ))
        ) : (
          !isLoading && <p className="text-sm text-gray-500 text-center py-4">ไม่มีกำหนดการล่าสุด</p>
        )}
      </div>
    </div>
  );
});
CalendarSidebar.displayName = 'CalendarSidebar';

// ===================================================================
//                        CALENDAR PAGE COMPONENT
// ===================================================================

const CalendarPage: React.FC = () => {
  const {
    currentDate, allEvents, isLoading, upcomingEvents,
    handlePrevMonth, handleNextMonth, calendarDays,
  } = useCalendar();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleAddEvent = useCallback(() => setIsModalOpen(true), []);
  const handleModalClose = useCallback(() => setIsModalOpen(false), []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    toast.info(`รายละเอียด: ${event.title} (${event.details})`);
  }, []);

  const stats = useMemo(() => ({
    total: allEvents.length,
    completed: allEvents.filter(e => e.status?.toLowerCase() === 'completed').length,
    pending: allEvents.filter(e => e.status?.toLowerCase() === 'pending').length,
    cancelled: allEvents.filter(e => e.status?.toLowerCase() === 'cancelled').length,
  }), [allEvents]);

  return (
    <>
      <CustomerFormModal isOpen={isModalOpen} onClose={handleModalClose} mode="add"/>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CalendarSidebar events={upcomingEvents} isLoading={isLoading} onEventClick={handleEventClick} />

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-sans text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> ปฏิทินการจอง
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="เดือนก่อนหน้า"><FaChevronLeft className="h-5 w-5 text-gray-600" /></button>
                <span className="text-lg font-semibold text-gray-800 w-40 text-center">{formatDate(currentDate, { month: 'long', year: 'numeric' })}</span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="เดือนถัดไป"><FaChevronRight className="h-5 w-5 text-gray-600" /></button>
              </div>
              <button onClick={handleAddEvent} className="btn-primary flex items-center gap-2 text-sm">
                <FaPlus /> <span>เพิ่มการจอง</span>
              </button>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-sm text-gray-600">การจองทั้งหมด</p></div>
              <div><p className="text-2xl font-bold text-blue-500">{stats.completed}</p><p className="text-sm text-gray-600">เสร็จสิ้น</p></div>
              <div><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p><p className="text-sm text-gray-600">รอดำเนินการ</p></div>
              <div><p className="text-2xl font-bold text-red-500">{stats.cancelled}</p><p className="text-sm text-gray-600">ยกเลิก</p></div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
              <div key={`day-${day}`} className="text-center font-semibold text-sm py-2 bg-gray-50 text-gray-600">{day}</div>
            ))}
            {calendarDays.map((dayInfo, index) => {
              if (!dayInfo) return <div key={`empty-${index}`} className="bg-gray-50 min-h-[100px]"></div>;
              const { date, isToday, events: dayEvents } = dayInfo;
              return (
                <div key={date.toString()} className="relative min-h-[100px] bg-white p-2">
                  <time dateTime={date.toISOString()} className={`text-sm font-semibold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-800'}`}>{date.getDate()}</time>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event: CalendarEvent) => (
                      <button key={`day-event-${event.id}`} onClick={() => handleEventClick(event)} className="w-full text-left p-1 rounded-md hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(event.status)}`}></div>
                          <p className="text-xs font-medium text-gray-700 truncate">{event.details}</p>
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 3} เพิ่มเติม</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-gray-600 font-medium">สถานะ:</span>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>เสร็จสิ้น</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>รอดำเนินการ</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>ยกเลิก</span></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;