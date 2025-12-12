// src/utils/constants.ts

// ===================================================================
//                        APP CONSTANTS
// ===================================================================

/**
 * สถานะของข้อมูล
 */
export const STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
} as const;

/**
 * ประเภทรถ
 */
export const CAR_TYPES = {
  CAR: 'CAR',
  VAN: 'VAN',
  TRUCK: 'TRUCK',
  MC: 'MC',
} as const;

/**
 * ชื่อประเภทรถภาษาไทย
 */
export const CAR_TYPE_LABELS: Record<string, string> = {
  CAR: 'รถเก๋ง',
  VAN: 'รถตู้',
  TRUCK: 'รถกระบะ',
  MC: 'มอเตอร์ไซค์',
};

/**
 * สีสถานะ
 */
export const STATUS_COLORS = {
  pending: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
  processing: '#3B82F6',
} as const;

/**
 * ขนาดหน้าต่างสำหรับ pagination
 */
export const PAGE_SIZE = 10;

/**
 * วันในสัปดาห์ภาษาไทย
 */
export const THAI_DAYS: Record<string, string> = {
  จ: 'จันทร์',
  อ: 'อังคาร',
  พ: 'พุธ',
  พฤ: 'พฤหัสบดี',
  ศ: 'ศุกร์',
  ส: 'เสาร์',
  อา: 'อาทิตย์',
};

/**
 * เดือนภาษาไทย
 */
export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

/**
 * ระยะเวลา debounce (milliseconds)
 */
export const DEBOUNCE_DELAY = 300;

/**
 * ระยะเวลา toast (milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;
