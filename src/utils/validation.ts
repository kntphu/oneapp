// src/utils/validation.ts

// ===================================================================
//                        VALIDATION FUNCTIONS
// ===================================================================

/**
 * ตรวจสอบว่าอีเมลถูกต้องหรือไม่
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * ตรวจสอบว่าเบอร์โทรศัพท์ไทยถูกต้องหรือไม่
 */
export const isValidThaiPhone = (phone: string): boolean => {
  const phoneRegex = /^(0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

/**
 * ตรวจสอบว่ารหัสผ่านมีความแข็งแรงเพียงพอหรือไม่
 * - อย่างน้อย 8 ตัวอักษร
 * - มีตัวพิมพ์เล็ก
 * - มีตัวพิมพ์ใหญ่
 * - มีตัวเลข
 */
export const isStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLowerCase && hasUpperCase && hasNumber;
};

/**
 * ตรวจสอบว่าค่าไม่เป็น null, undefined หรือ empty string
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * ตรวจสอบความยาวของข้อความ
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * ตรวจสอบว่าค่าเป็นตัวเลขหรือไม่
 */
export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * ตรวจสอบว่า URL ถูกต้องหรือไม่
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
