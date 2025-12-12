// src/utils/formatters.ts

// ===================================================================
//                        DATE & TIME FORMATTERS
// ===================================================================

/**
 * จัดรูปแบบวันที่เป็นข้อความภาษาไทยตาม options ที่กำหนด
 * @param date - วันที่ที่ต้องการจัดรูปแบบ
 * @param options - ตัวเลือกสำหรับปรับแต่งการแสดงผล (Intl.DateTimeFormatOptions)
 * @returns ข้อความวันที่ที่จัดรูปแบบแล้ว
 */
export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => {
  try {
    return date.toLocaleDateString('th-TH', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * จัดรูปแบบวันที่และเวลาแบบเต็มสำหรับแสดงผล (เช่น 'วันอังคารที่ 9 กันยายน 2568, 15:30')
 * @param date - วันที่ที่ต้องการจัดรูปแบบ
 * @returns ข้อความวันที่และเวลาที่จัดรูปแบบแล้ว
 */
export const formatFullDateTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  try {
    return date.toLocaleString('th-TH', options);
  } catch (error) {
    console.error("Error formatting full date time:", error);
    return "Invalid Date";
  }
};

/**
 * จัดรูปแบบวันที่และเวลาสำหรับแสดงผลแยกส่วน
 * @param dateString - ข้อความวันที่ที่ต้องการจัดรูปแบบ
 * @returns Object ที่มีวันที่ (วัน/เดือน/ปี) และเวลา (ชั่วโมง:นาที:วินาที) ที่จัดรูปแบบแล้ว
 */
export const formatDateTime = (dateString: string): { date: string; time: string } => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return { date: 'Invalid Date', time: '' };
      }
      return {
        date: date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }),
        time: date.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      };
    } catch {
      return { date: 'ไม่ระบุ', time: '' };
    }
  };

// ===================================================================
//                        STATUS FORMATTERS
// ===================================================================

/**
 * คืนค่าสี Tailwind CSS ตามสถานะของลูกค้า
 * @param status - สถานะ ('pending', 'cancelled', 'completed')
 * @returns Class ของสีพื้นหลังใน Tailwind CSS
 */
export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'completed':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
};