// src/components/CustomerMobileCard.tsx

import React, { memo } from 'react';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaFilePdf } from 'react-icons/fa';
import type { FormattedCustomer } from '@api/types';
import CarTypeIcon from '@/components/common/CarTypeIcon';

interface CustomerMobileCardProps {
  customer: FormattedCustomer;
  onTogglePublished: (customer: FormattedCustomer) => void;
  onEdit: (customer: FormattedCustomer) => void;
  onDelete: (customer: FormattedCustomer) => void;
  onPdfClick: (pdfUrl: string) => void;
  isTogglePending: boolean;
}

const CustomerIcon: React.FC<{ customer: FormattedCustomer; onPdfClick: (pdfUrl: string) => void }> = memo(({ customer, onPdfClick }) => {
  if (customer.pdf) {
    return (
      <button
        onClick={() => onPdfClick(customer.pdf!)}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
        title="คลิกเพื่อเปิดไฟล์ PDF"
      >
        <FaFilePdf className="h-5 w-5 text-red-600" />
      </button>
    );
  }
  return <CarTypeIcon type={customer.carType} size="md" className="flex-shrink-0" />;
});
CustomerIcon.displayName = 'CustomerIcon';

const StatusChip: React.FC<{ status: string }> = memo(({ status }) => {
  let chipClass = 'bg-gray-100 text-gray-800';
  let text = status;

  switch (status?.toLowerCase()) {
    case 'pending':
      chipClass = 'bg-yellow-100 text-yellow-800';
      text = 'รอดำเนินการ';
      break;
    case 'completed':
      chipClass = 'bg-success/10 text-green-700';
      text = 'เสร็จสิ้น';
      break;
    case 'cancelled':
      chipClass = 'bg-error/10 text-error';
      text = 'ยกเลิก';
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${chipClass}`}>
      {text}
    </span>
  );
});
StatusChip.displayName = 'StatusChip';

const CustomerMobileCard: React.FC<CustomerMobileCardProps> = ({
  customer,
  onTogglePublished,
  onEdit,
  onDelete,
  onPdfClick,
  isTogglePending,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
      
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CustomerIcon customer={customer} onPdfClick={onPdfClick} />
            <div className="min-w-0">
              <div className="font-semibold font-sans text-gray-900 truncate" title={`${customer.title} ${customer.name} ${customer.lastName}`}>
                {`${customer.title} ${customer.name} ${customer.lastName}`}
              </div>
              <div className="text-xs text-gray-500">{customer.idCard}</div>
            </div>
          </div>
          <StatusChip status={customer.status} />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">เลขจอง</p>
            <p className="font-semibold text-primary-dark font-sans text-base">{`${customer.wantedGroup} ${customer.wantedNo}`}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">ยี่ห้อรถ</p>
              <p className="font-medium text-gray-800 text-sm">{customer.carBrand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">วันจอง</p>
              <p className="font-medium text-gray-800 text-sm">{new Date(customer.dateReserve).toLocaleDateString('th-TH')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">หมายเลขตัวถัง</p>
              <p className="font-mono text-gray-600 text-sm break-all">{customer.carBody}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-px bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onTogglePublished(customer)}
          disabled={isTogglePending}
          className={`flex-1 py-3 px-2 text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
            customer.published ? 'text-success hover:bg-success/5' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {customer.published ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          <span>{customer.published ? 'แสดงผล' : 'ซ่อน'}</span>
        </button>
        <button
          onClick={() => onEdit(customer)}
          className="flex-1 py-3 px-2 text-xs flex items-center justify-center gap-2 text-info hover:bg-info/5"
        >
          <FaEdit size={14} />
          <span>แก้ไข</span>
        </button>
        <button
          onClick={() => onDelete(customer)}
          className="flex-1 py-3 px-2 text-xs flex items-center justify-center gap-2 text-error hover:bg-error/5"
        >
          <FaTrash size={14} />
          <span>ลบ</span>
        </button>
      </div>
    </div>
  );
};

export default memo(CustomerMobileCard);