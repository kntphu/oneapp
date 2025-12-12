// src/utils/hooks/useCalendar.ts

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCustomer } from '@api/ApiCollection';
import type { FormattedCustomer } from '@api/types';
import { CACHE_CONFIG } from '@/config';

// ===================================================================
//                        CUSTOM HOOK: useCalendar
// ===================================================================

/**
 * Custom Hook สำหรับจัดการ Logic ที่เกี่ยวกับปฏิทินทั้งหมด
 * เช่น การดึงข้อมูลลูกค้า, การสร้าง Event, และการคำนวณวันในปฏิทิน
 */
export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const { data: customerData, isLoading } = useQuery<FormattedCustomer[]>({
    queryKey: ['customersForCalendar'],
    queryFn: fetchCustomer,
    staleTime: CACHE_CONFIG.staleTime.medium,
    gcTime: CACHE_CONFIG.gcTime.medium,
    select: (data) => data?.filter(customer => customer.dateReserve) || [],
  });

  const allEvents = useMemo(() => {
    if (!customerData) return [];
    
    return customerData.map(c => ({
      id: c.id,
      date: new Date(c.dateReserve),
      title: `${c.name} ${c.lastName}`,
      details: `${c.wantedGroup} ${c.wantedNo}`,
      status: c.status || 'pending',
      customer: c,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [customerData]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  }, [allEvents]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const getEventsForDate = useCallback((targetDate: Date) => {
    const targetDateString = targetDate.toDateString();
    return allEvents.filter(event => event.date.toDateString() === targetDateString);
  }, [allEvents]);

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();

    const days = [];
    
    // Add empty cells for days before the start of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        events: getEventsForDate(date)
      });
    }
    
    return days;
  }, [currentDate, getEventsForDate]);

  return {
    currentDate,
    setCurrentDate,
    allEvents,
    upcomingEvents,
    isLoading,
    handlePrevMonth,
    handleNextMonth,
    calendarDays,
  };
};