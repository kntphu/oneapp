// src/components/common/Pagination.tsx

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  itemsCount: number;
  totalItems: number;
  itemName?: string;
}

// ===================================================================
//                        PAGINATION COMPONENT
// ===================================================================

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  itemsCount,
  totalItems,
  itemName = 'รายการ',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const baseButtonClass = "flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-colors duration-200 ease-in-out";
  const activeButtonClass = "bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark";
  const disabledButtonClass = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-6 border-t border-gray-200 gap-4">
      <div className="text-sm text-gray-600">
        แสดง <span className="font-semibold text-gray-800">{itemsCount}</span> จาก{' '}
        <span className="font-semibold text-gray-800">{totalItems}</span> {itemName}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className={`${baseButtonClass} ${currentPage === 1 ? disabledButtonClass : activeButtonClass}`}
          aria-label="หน้าก่อนหน้า"
        >
          <FaChevronLeft size={14} />
        </button>

        <span className="text-sm font-semibold text-gray-800 px-2">
          หน้า {currentPage} / {totalPages}
        </span>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`${baseButtonClass} ${currentPage === totalPages ? disabledButtonClass : activeButtonClass}`}
          aria-label="หน้าถัดไป"
        >
          <FaChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;