// src/utils/hooks/useConfirmationToast.tsx

import React from 'react';
import { toast } from 'react-toastify';
import { FaExclamationTriangle } from 'react-icons/fa';

// ===================================================================
//                        INTERFACE DEFINITION
// ===================================================================

interface ConfirmationToastProps {
  title: string;
  message: string;
  onConfirm: () => void;
  closeToast?: () => void;
}

// ===================================================================
//                        CONFIRMATION COMPONENT
// ===================================================================

/**
 * Component สำหรับแสดง UI ของ Toast เพื่อยืนยันการดำเนินการ
 */
const ConfirmToastComponent: React.FC<ConfirmationToastProps> = ({
  title,
  message,
  onConfirm,
  closeToast,
}) => (
  <div className="p-2 text-center font-body">
    <div className="flex justify-center items-center gap-3 mb-3">
      <FaExclamationTriangle className="text-error h-6 w-6" />
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
    </div>

    <p className="text-gray-700 text-base px-2">{message}</p>

    <div className="flex justify-center gap-4 mt-5">
      <button
        onClick={closeToast}
        className="btn-secondary px-6 py-2 text-sm"
      >
        ยกเลิก
      </button>
      <button
        onClick={() => {
          onConfirm();
          if (closeToast) closeToast();
        }}
        className="btn-primary bg-error hover:bg-error/90 px-6 py-2 text-sm"
      >
        ใช่, ยืนยัน
      </button>
    </div>
  </div>
);

// ===================================================================
//                        CUSTOM HOOK
// ===================================================================

/**
 * Custom Hook สำหรับเรียกใช้งาน Confirmation Toast
 */
export const useConfirmationToast = () => {
  const showConfirmationToast = ({
    title,
    message,
    onConfirm,
  }: Omit<ConfirmationToastProps, 'closeToast'>) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToastComponent
          title={title}
          message={message}
          onConfirm={onConfirm}
          closeToast={closeToast}
        />
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        style: {
          backgroundColor: 'white',
          color: '#1f2937', // text-gray-800
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '16px', // rounded-lg from tailwind.config.js
          width: '400px',
          maxWidth: '90vw',
        },
      }
    );
  };

  return { showConfirmationToast };
};