// src/pages/CustomerPage.tsx

import React, { useState, useMemo, useCallback, useTransition, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaSearch, FaPlus, FaUsers, FaSpinner
} from 'react-icons/fa';

import { fetchCustomer, deleteCustomer, toggleCustomerPublished } from '@api/ApiCollection';
import type { FormattedCustomer } from '@api/types';
import { CACHE_CONFIG } from '@/config';
import CustomerFormModal from '@components/CustomerFormModal';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showErrorToast } from '@utils/toastUtils';
import { useConfirmationToast } from '@utils/hooks/useConfirmationToast';
import Pagination from '@components/common/Pagination';
import SkeletonLoader from '@components/common/SkeletonLoader';
import { useResponsive } from '@utils/hooks/useResponsive';

import CustomerTable from '@components/CustomerTable';
import CustomerMobileCard from '@components/CustomerMobileCard';


const CustomerPageHeader: React.FC<{
  customerCount: number;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  isPending: boolean;
}> = memo(({ customerCount, searchTerm, onSearchChange, onAddClick, isPending }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <FaUsers className="h-5 w-5 text-primary-dark"/>
      </div>
      <div>
        <h2 className="text-xl font-bold font-sans text-gray-900">ข้อมูลลูกค้าทั้งหมด</h2>
        <p className="text-sm text-gray-500">จำนวน {customerCount} ของลูกค้าทั้งหมด</p>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full sm:w-auto">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาข้อมูลลูกค้า...."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2"><FaSpinner className="w-4 h-4 text-primary animate-spin" /></div>
        )}
      </div>
      
      <button onClick={onAddClick} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
        <FaPlus size={14} />
        <span>เพิ่มการจอง</span>
      </button>
    </div>
  </div>
));
CustomerPageHeader.displayName = 'CustomerPageHeader';

const CustomerPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingCustomer, setEditingCustomer] = useState<FormattedCustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  
  const itemsPerPage = 15;
  const { showConfirmationToast } = useConfirmationToast();
  const { isMobile } = useResponsive();

  const { data: customers, isLoading, isError } = useQuery<FormattedCustomer[]>({
    queryKey: ['customers'],
    queryFn: fetchCustomer,
    staleTime: CACHE_CONFIG.staleTime.short,
    gcTime: CACHE_CONFIG.gcTime.medium,
  });

  const deleteMutation = useApiMutation({
    mutationFn: deleteCustomer,
    queryKeyToInvalidate: ['customers'],
    successMessage: 'ลบข้อมูลลูกค้าสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการลบข้อมูล',
  });

  const toggleMutation = useApiMutation({
    mutationFn: toggleCustomerPublished,
    queryKeyToInvalidate: ['customers'],
    successMessage: 'อัปเดตสถานะการแสดงผลสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
  });

  const handleDeleteClick = useCallback((customer: FormattedCustomer) => {
    showConfirmationToast({
      title: 'ยืนยันการลบข้อมูล',
      message: `คุณต้องการลบข้อมูลการจองของ "${customer.title} ${customer.name} ${customer.lastName}" ใช่หรือไม่?`,
      onConfirm: () => deleteMutation.mutate(customer.id),
    });
  }, [deleteMutation, showConfirmationToast]);
  
  const handleTogglePublished = useCallback((customer: FormattedCustomer) => {
    toggleMutation.mutate(customer.id);
  }, [toggleMutation]);

  const handlePdfClick = useCallback((pdfUrl: string) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleEditClick = useCallback((customer: FormattedCustomer) => {
    setModalMode('edit');
    setEditingCustomer(customer);
    setIsModalOpen(true);
  }, []);

  const handleAddClick = useCallback(() => {
    setModalMode('add');
    setEditingCustomer(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    });
  }, []);
  
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm.trim()) return customers;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return customers.filter(customer =>
      Object.values(customer).some(value => 
        String(value).toLowerCase().includes(lowercaseSearch)
      )
    );
  }, [customers, searchTerm]);

  const { paginatedCustomers, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    const pages = Math.ceil(filteredCustomers.length / itemsPerPage);
    return { paginatedCustomers: paginated, totalPages: pages > 0 ? pages : 1 };
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const handleNextPage = useCallback(() => setCurrentPage(prev => Math.min(prev + 1, totalPages)), [totalPages]);
  const handlePrevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);
  
  if (isError) {
    showErrorToast('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า');
  }

  return (
    <>
      <CustomerFormModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        mode={modalMode}
        customer={editingCustomer ?? undefined} 
      />

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 md:p-6">
        <CustomerPageHeader
          customerCount={filteredCustomers.length}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddClick={handleAddClick}
          isPending={isPending}
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          isMobile ? <SkeletonLoader type="card" count={5} className="space-y-4" /> : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>{Array.from({ length: 7 }).map((_, i) => <th key={i} className="px-6 py-4"></th>)}</tr>
                      </thead>
                      <tbody><SkeletonLoader type="table" count={10} /></tbody>
                  </table>
              </div>
          )
        ) : isMobile ? (
          <div className="space-y-4">
            {paginatedCustomers.map(customer => (
              <CustomerMobileCard
                key={`mobile-${customer.id}`}
                customer={customer}
                onTogglePublished={handleTogglePublished}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onPdfClick={handlePdfClick}
                isTogglePending={toggleMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <CustomerTable
            customers={paginatedCustomers}
            onTogglePublished={handleTogglePublished}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onPdfClick={handlePdfClick}
            isTogglePending={toggleMutation.isPending}
          />
        )}
      </div>

      {totalPages > 1 && (
          <div className="mt-6">
              <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  itemsCount={paginatedCustomers.length}
                  totalItems={filteredCustomers.length}
                  itemName="ผลลัพธ์"
              />
          </div>
      )}
    </>
  );
};

export default CustomerPage;