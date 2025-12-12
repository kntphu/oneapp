// src/components/common/CustomDatePicker.tsx

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useClickOutside } from '@utils/hooks/useClickOutside';
import { formatDate } from '@utils/formatters';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// ===================================================================
//                        HELPER FUNCTIONS
// ===================================================================

const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const monthsOfYear = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// ===================================================================
//                        CUSTOM DATE PICKER COMPONENT
// ===================================================================

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datepickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(datepickerRef, () => setIsOpen(false));

  useEffect(() => {
    if (value) {
      const selected = new Date(value);
      setCurrentMonth(selected.getMonth());
      setCurrentYear(selected.getFullYear());
    }
  }, [value]);

  const selectedDate = useMemo(() => value ? new Date(value) : null, [value]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(new Date(currentYear, currentMonth, i));
    }
    return daysArray;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  }, [currentMonth]);

  const handleDateSelect = (day: Date) => {
    const year = day.getFullYear();
    const month = (day.getMonth() + 1).toString().padStart(2, '0');
    const date = day.getDate().toString().padStart(2, '0');
    onChange(`${year}-${month}-${date}`);
    setIsOpen(false);
  };
  
  const formattedDisplayDate = useMemo(() => {
    return selectedDate ? formatDate(selectedDate, { day: '2-digit', month: 'long', year: 'numeric' }) : '';
  }, [selectedDate]);

  return (
    <div className="relative font-body" ref={datepickerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="form-input flex items-center justify-between text-left w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
          {formattedDisplayDate || 'เลือกวันที่'}
        </span>
        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full max-w-xs bg-white rounded-xl shadow-lg border border-gray-200 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><FaChevronLeft className="h-4 w-4" /></button>
            <div className="font-semibold text-gray-800">
              {monthsOfYear[currentMonth]} {currentYear + 543}
            </div>
            <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><FaChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {daysOfWeek.map(day => <div key={day} className="font-medium text-gray-500 py-1">{day}</div>)}
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`empty-${index}`}></div>;
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              
              const dayClasses = `w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer 
                ${isSelected ? 'bg-primary text-white font-bold' : ''} 
                ${!isSelected && isToday ? 'bg-primary/10 text-primary-dark font-bold' : ''} 
                ${!isSelected && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}`;
              
              return (
                <div key={day.toString()} className="flex justify-center items-center">
                  <button type="button" onClick={() => handleDateSelect(day)} className={dayClasses}>
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};