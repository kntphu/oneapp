// src/components/CalendarHome.tsx

import React, { useState, useMemo, useCallback, memo } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import CustomerFormModal from '@components/CustomerFormModal';
import { useCalendar } from '@utils/hooks/useCalendar';
import { formatDate, getStatusColor } from '@utils/formatters';
import { useResponsive } from '@utils/hooks/useResponsive';
import SkeletonLoader from '@components/common/SkeletonLoader';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface CalendarHomeProps {
  className?: string;
}

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  details: string;
  status: string;
  customer: any;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

/**
 * Component แสดงผลปฏิทินแบบตารางสำหรับ Desktop
 */
const DesktopCalendarView: React.FC<{
  calendarDays: any[];
  onEventClick: (event: CalendarEvent) => () => void;
}> = memo(({ calendarDays, onEventClick }) => (
  <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
      <div key={`day-header-${day}`} className="text-center font-semibold text-sm py-2 bg-gray-50 text-gray-600">{day}</div>
    ))}
    {calendarDays.map((dayInfo, index) => {
      if (!dayInfo) return <div key={`empty-${index}`} className="bg-gray-50 min-h-[100px]"></div>;
      const { date, isToday, events } = dayInfo;
      return (
        <div key={date.toString()} className="relative min-h-[100px] bg-white p-2">
          <time dateTime={date.toISOString()} className={`text-sm font-semibold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-800'}`}>{date.getDate()}</time>
          <div className="mt-1 space-y-1">
            {events.slice(0, 3).map((event: CalendarEvent) => (
              <button key={`day-event-${event.id}`} onClick={onEventClick(event)} className="w-full text-left p-1 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(event.status)}`}></div>
                  <p className="text-xs font-medium text-gray-700 truncate">{event.details}</p>
                </div>
              </button>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500 text-center">+{events.length - 3} เพิ่มเติม</div>
            )}
          </div>
        </div>
      );
    })}
  </div>
));
DesktopCalendarView.displayName = 'DesktopCalendarView';

/**
 * Component แสดงผลปฏิทินแบบ Agenda List สำหรับ Mobile
 */
const MobileAgendaView: React.FC<{
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => () => void;
  isLoading: boolean;
}> = memo(({ events, onEventClick, isLoading }) => (
  <div className="space-y-3">
    {isLoading && <SkeletonLoader type="card" count={5} />}
    {!isLoading && events.length === 0 && (
        <div className="text-center py-10 text-gray-500">
            <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300" />
            <p>ไม่มีกำหนดการล่าสุด</p>
        </div>
    )}
    {!isLoading && events.map((event) => (
      <button key={`mobile-event-${event.id}`} onClick={onEventClick(event)} className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary/5 rounded-xl transition-all duration-200 group">
        <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary-dark font-bold">
          <span className="text-sm font-medium uppercase">{formatDate(event.date, { month: 'short' })}</span>
          <span className="text-3xl tracking-tight">{event.date.getDate()}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-gray-800 group-hover:text-primary-dark transition-colors truncate" title={event.title}>{event.title}</p>
          <p className="text-sm text-gray-600 truncate">{event.details}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></div>
            <span className="text-xs text-gray-500 capitalize">{event.status}</span>
          </div>
        </div>
      </button>
    ))}
  </div>
));
MobileAgendaView.displayName = 'MobileAgendaView';

// ===================================================================
//                        CALENDAR HOME COMPONENT
// ===================================================================

/**
 * Component ปฏิทินที่แสดงผลในหน้า Home
 */
const CalendarHome: React.FC<CalendarHomeProps> = ({ className = '' }) => {
  const {
    currentDate, allEvents, isLoading: loadingCalendar,
    handlePrevMonth, handleNextMonth, calendarDays,
  } = useCalendar();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isMobile } = useResponsive();

  const handleAddEvent = useCallback(() => setIsModalOpen(true), []);
  const handleModalClose = useCallback(() => setIsModalOpen(false), []);

  const createEventClickHandler = useCallback((event: CalendarEvent) => () => {
    toast.info(`รายละเอียด: ${event.title} (${event.details})`);
  }, []);
  
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  }, [allEvents]);

  return (
    <>
      <CustomerFormModal isOpen={isModalOpen} onClose={handleModalClose} mode="add" />
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-sans text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            ปฏิทินการจอง
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="เดือนก่อนหน้า">
                <FaChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-lg font-semibold text-gray-800 w-40 text-center">{formatDate(currentDate, { month: 'long', year: 'numeric' })}</span>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="เดือนถัดไป">
                <FaChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button onClick={handleAddEvent} className="btn-primary flex items-center gap-2 text-sm">
              <FaPlus />
              <span className="hidden sm:inline">เพิ่มการจอง</span>
              <span className="sm:hidden">เพิ่ม</span>
            </button>
          </div>
        </div>
        
        {isMobile ? (
          <MobileAgendaView 
            events={upcomingEvents} 
            onEventClick={createEventClickHandler} 
            isLoading={loadingCalendar}
          />
        ) : (
          <DesktopCalendarView 
            calendarDays={calendarDays} 
            onEventClick={createEventClickHandler} 
          />
        )}
        
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-gray-600 font-medium">สถานะ:</span>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>เสร็จสิ้น</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>รอดำเนินการ</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>ยกเลิก</span></div>
        </div>
      </div>
    </>
  );
};

export default CalendarHome;