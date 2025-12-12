// src/utils/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * Hook สำหรับทำ debounce value
 * ใช้เพื่อลดการเรียก API หรือการประมวลผลที่ไม่จำเป็นเมื่อมีการพิมพ์ข้อความ
 *
 * @param value - ค่าที่ต้องการทำ debounce
 * @param delay - ระยะเวลาหน่วง (milliseconds) ค่าเริ่มต้น 500ms
 * @returns ค่าที่ถูก debounce แล้ว
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // เรียก API เมื่อ debouncedSearch เปลี่ยน
 *   fetchSearchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
