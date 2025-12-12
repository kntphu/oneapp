// src/utils/toastUtils.ts

import { toast, type ToastOptions } from 'react-toastify';

// ===================================================================
//                        DEFAULT CONFIGURATION
// ===================================================================

/**
 * การตั้งค่าพื้นฐานสำหรับ Toast ทุกประเภท
 */
const commonOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// ===================================================================
//                        TOAST HELPER FUNCTIONS
// ===================================================================

/**
 * แสดง Success Toast (สีเขียว)
 * @param message - ข้อความที่ต้องการให้แสดง
 * @param options - การตั้งค่าเพิ่มเติมสำหรับ Toast
 */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...commonOptions, ...options });
};

/**
 * แสดง Error Toast (สีแดง)
 * @param message - ข้อความที่ต้องการให้แสดง
 * @param options - การตั้งค่าเพิ่มเติมสำหรับ Toast
 */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...commonOptions, autoClose: 5000, ...options });
};

/**
 * แสดง Info Toast (สีฟ้า)
 * @param message - ข้อความที่ต้องการให้แสดง
 * @param options - การตั้งค่าเพิ่มเติมสำหรับ Toast
 */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...commonOptions, ...options });
};

/**
 * แสดง Warning Toast (สีเหลือง)
 * @param message - ข้อความที่ต้องการให้แสดง
 * @param options - การตั้งค่าเพิ่มเติมสำหรับ Toast
 */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warn(message, { ...commonOptions, ...options });
};