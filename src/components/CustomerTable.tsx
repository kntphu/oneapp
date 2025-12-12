// src/components/CustomerTable.tsx

import React, { memo } from 'react';
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaFilePdf } from 'react-icons/fa';
import type { FormattedCustomer } from '@api/types';
import CarTypeIcon from '@/components/common/CarTypeIcon';

interface CustomerTableProps {
  customers: FormattedCustomer[];
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

const ActionButtons: React.FC<{
  customer: FormattedCustomer;
  onTogglePublished: (customer: FormattedCustomer) => void;
  onEdit: (customer: FormattedCustomer) => void;
  onDelete: (customer: FormattedCustomer) => void;
  isTogglePending: boolean;
}> = memo(({ customer, onTogglePublished, onEdit, onDelete, isTogglePending }) => (
  <div className="flex items-center justify-end gap-1">
    
    <button
      onClick={() => onTogglePublished(customer)}
      disabled={isTogglePending}
      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        customer.published ? 'text-success hover:bg-success/10' : 'text-gray-400 hover:bg-gray-100'
      }`}
      title={customer.published ? 'แสดงผล' : 'ซ่อน'}
    >
      {customer.published ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
    </button>

    <button
      onClick={() => onEdit(customer)}
      className="p-2 text-gray-400 hover:text-info hover:bg-info/10 rounded-lg transition-colors"
      title="แก้ไขข้อมูล"
    >
      <FaEdit size={16} />
    </button>
    <button
      onClick={() => onDelete(customer)}
      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
      title="ลบข้อมูล"
    >
      <FaTrash size={16} />
    </button>
  </div>
));
ActionButtons.displayName = 'ActionButtons';


const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onTogglePublished,
  onEdit,
  onDelete,
  onPdfClick,
  isTogglePending,
}) => {
  
  const thClassName = "px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider";

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-card">
      <table className="w-full min-w-[1024px]">
        
        <thead className="bg-white border-b-2 border-gray-100">
          <tr>
            <th className={`${thClassName} w-16`}>ID</th>
            <th className={`${thClassName} text-left`}>ชื่อลูกค้า</th>
            <th className={`${thClassName} text-left`}>ข้อมูลรถ</th>
            <th className={`${thClassName} text-left`}>เลขจอง</th>
            <th className={`${thClassName} text-left`}>วันที่จองเลข</th>
            <th className={thClassName}>สถานะ</th>
            <th className={thClassName}>ดำเนินการ</th>
          </tr>
        </thead>
        
        <tbody className="bg-white">
          {customers.map(customer => (
            <tr key={`customer-${customer.id}`} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
              
              <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-mono text-gray-500">
                {customer.id}
              </td>

              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center gap-4">
                  <CustomerIcon customer={customer} onPdfClick={onPdfClick} />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate max-w-[25ch]" title={`${customer.title} ${customer.name} ${customer.lastName}`}>
                      {`${customer.title} ${customer.name} ${customer.lastName}`}
                    </div>
                    <div className="text-sm text-gray-500">{customer.idCard}</div>
                  </div>
                </div>
              </td>
                            
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-800">{customer.carBrand}</div>
                <div 
                  className="text-xs text-gray-500 font-mono mt-1 truncate max-w-[20ch]" 
                  title={customer.carBody}
                >
                  {customer.carBody}
                </div>
              </td>

              <td className="px-6 py-5 whitespace-nowrap">
                <div className="font-semibold text-primary-dark text-sm">{`${customer.wantedGroup} ${customer.wantedNo}`}</div>
              </td>
              
              <td className="px-6 py-5 whitespace-nowrap">
                <span className="text-sm text-gray-700">{new Date(customer.dateReserve).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              </td>
              
              <td className="px-6 py-5 whitespace-nowrap text-center">
                <StatusChip status={customer.status} />
              </td>
              
              <td className="px-6 py-5 whitespace-nowrap text-right">
                <ActionButtons 
                  customer={customer} 
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  onTogglePublished={onTogglePublished}
                  isTogglePending={isTogglePending}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(CustomerTable);