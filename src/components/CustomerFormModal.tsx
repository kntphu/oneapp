// src/components/CustomerFormModal.tsx

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaUser, FaCar, FaFileAlt, FaTimes, FaSpinner, FaSave } from 'react-icons/fa';
import {
  addCustomer, updateCustomer, fetchTitles, fetchPersTypes,
  fetchCarTypes, fetchVehicleBrands
} from '@api/ApiCollection';
import type { FormattedCustomer } from '@api/types';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showWarningToast } from '@utils/toastUtils';
import { CustomDropdown, type DropdownOption } from '@components/common/CustomDropdown';
import { CustomDatePicker } from '@components/common/CustomDatePicker';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  customer?: FormattedCustomer;
}

interface FrontendFormData {
  title: string; name: string; lastName: string; idCard: string; phone: string;
  personalType: string; carType: string; carBrand: string; carBody: string;
  wantedGroup: string; wantedNo: string; dateReserve: string; amount: string;
  status: string;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> =
  memo(({ title, icon: Icon, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
));
FormSection.displayName = 'FormSection';

// ===================================================================
//                        CUSTOMER FORM MODAL COMPONENT
// ===================================================================

/**
 * Modal สำหรับเพิ่มหรือแก้ไขข้อมูลลูกค้า
 */
const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, mode, customer }) => {
  const personalTypeMap: Record<string, { display: string; icon: React.ComponentType<any> }> = {
    'personal': { display: 'บุคคลธรรมดา', icon: FaUser },
    'business': { display: 'นิติบุคคล / ชาวต่างชาติ', icon: FaFileAlt }
  };

  const carTypeMap: Record<string, { display: string; description: string }> = {
    'CAR': { display: 'รถเก๋ง (4 ประตู ไม่เกิน 7 ที่นั่ง)', description: '4 ประตู ไม่เกิน 7 ที่นั่ง' },
    'VAN': { display: 'รถตู้ (เกิน 7 ที่นั่ง)', description: 'เกิน 7 ที่นั่ง' },
    'TRUCK': { display: 'รถกระบะ (2 ประตู)', description: '2 ประตู' },
    'MC': { display: 'มอเตอร์ไซค์', description: '' }
  };
  
  const initialFormData: FrontendFormData = useMemo(() => ({
    title: '', name: '', lastName: '', idCard: '', phone: '', personalType: '',
    carType: '', carBrand: '', carBody: '', wantedGroup: '', wantedNo: '',
    dateReserve: new Date().toISOString().split('T')[0],
    amount: '', status: 'Pending',
  }), []);

  const [formData, setFormData] = useState<FrontendFormData>(initialFormData);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && customer) {
        setFormData({
          title: customer.title || '', name: customer.name || '', lastName: customer.lastName || '',
          idCard: customer.idCard || '', phone: customer.phone || '', personalType: customer.personalType || '',
          carType: customer.carType || '', carBrand: customer.carBrand || '', carBody: customer.carBody || '',
          wantedGroup: customer.wantedGroup || '', wantedNo: customer.wantedNo || '',
          dateReserve: customer.dateReserve ? customer.dateReserve.split('T')[0] : new Date().toISOString().split('T')[0],
          amount: customer.amount || '', status: customer.status || 'Pending',
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, mode, customer, initialFormData]);

  const { data: titlesData, isLoading: isLoadingTitles } = useQuery({ queryKey: ['titles'], queryFn: fetchTitles, staleTime: Infinity });
  const { data: persTypesData, isLoading: isLoadingPersTypes } = useQuery({ queryKey: ['persTypes'], queryFn: fetchPersTypes, staleTime: Infinity });
  const { data: carTypesData, isLoading: isLoadingCarTypes } = useQuery({ queryKey: ['carTypes'], queryFn: fetchCarTypes, staleTime: Infinity });
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({ queryKey: ['brands'], queryFn: fetchVehicleBrands, staleTime: Infinity });

  const titleOptions: DropdownOption[] = useMemo(() => (titlesData?.titles || (titlesData as any)?.data || []).map((item: any) => ({ value: item.title_name || item.name || '', label: item.title_name || item.name || '' })), [titlesData]);
  
  const persTypeOptions: DropdownOption[] = useMemo(() => (persTypesData?.persTypes || (persTypesData as any)?.data || []).map((item: any) => {
      const name = item.pers_type_name || item.name || '';
      const displayInfo = personalTypeMap[name.toLowerCase()];
      return { value: name, label: displayInfo ? displayInfo.display : name };
  }), [persTypesData, personalTypeMap]);

  const carTypeOptions: DropdownOption[] = useMemo(() => {
    const rawItems = (carTypesData?.carTypes || (carTypesData as any)?.data || []);
    return rawItems.map((item: any) => {
      const name = item.car_type_name || item.name || '';
      const carTypeInfo = carTypeMap[name.toUpperCase()];
      return { value: name, label: carTypeInfo ? carTypeInfo.display : name };
    });
  }, [carTypesData, carTypeMap]);

  const brandOptions: DropdownOption[] = useMemo(() => (brandsData?.brands || (brandsData as any)?.data || []).map((item: any) => ({ value: item.brand_name || item.name || '', label: item.brand_name || item.name || '' })), [brandsData]);
  
  const statusOptions: DropdownOption[] = useMemo(() => [
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ], []);

  const mutation = useApiMutation({
    mutationFn: (data: FrontendFormData) => {
        const backendData = {
            title: data.title, name: data.name, lastname: data.lastName || '',
            idcard: data.idCard, phone: data.phone, personalType: data.personalType,
            carType: data.carType, carBrand: data.carBrand, carBody: data.carBody,
            wantedGroup: data.wantedGroup, wantedNo: data.wantedNo,
            dateReserve: data.dateReserve, amount: data.amount, status: data.status,
        };
        if (mode === 'edit' && customer) {
            return updateCustomer(customer.id, { ...backendData, lastName: data.lastName });
        }
        return addCustomer(backendData);
    },
    queryKeyToInvalidate: ['customers'],
    successMessage: mode === 'edit' ? 'แก้ไขข้อมูลลูกค้าสำเร็จ' : 'เพิ่มข้อมูลลูกค้าสำเร็จ',
    errorMessage: mode === 'edit' ? 'เกิดข้อผิดพลาดในการแก้ไข' : 'เกิดข้อผิดพลาดในการเพิ่ม',
    onSuccessCallback: onClose,
  });

  const handleFormChange = useCallback((name: keyof FrontendFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    const requiredFields: (keyof FrontendFormData)[] = ['title', 'name', 'idCard', 'phone', 'personalType', 'carType', 'carBrand', 'carBody', 'wantedGroup', 'wantedNo', 'dateReserve', 'amount'];
    return requiredFields.every(field => String(formData[field]).trim() !== '');
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      mutation.mutate(formData);
    } else {
      showWarningToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
    }
  }, [formData, isFormValid, mutation]);

  const handleClose = useCallback(() => { if (!mutation.isPending) onClose(); }, [mutation.isPending, onClose]);

  const modalTitle = useMemo(() => mode === 'edit' ? '✏️ แก้ไขข้อมูลการจอง' : '+ เพิ่มข้อมูลการจอง', [mode]);
  const buttonText = useMemo(() => mutation.isPending ? (mode === 'edit' ? 'กำลังแก้ไข...' : 'กำลังบันทึก...') : (mode === 'edit' ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'), [mode, mutation.isPending]);
  const isDataLoading = isLoadingTitles || isLoadingPersTypes || isLoadingCarTypes || isLoadingBrands;
  
  const inputClassName = "form-input";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 p-4 overflow-y-auto transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-auto flex flex-col animate-fade-in max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold font-sans text-gray-900">{modalTitle}</h2>
          <button onClick={handleClose} disabled={mutation.isPending} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50">
            <FaTimes size={20} />
          </button>
        </div>
        
        {isDataLoading && (<div className="p-6 text-center"><div className="flex items-center justify-center gap-2"><FaSpinner className="animate-spin text-primary" /><span className="text-gray-600">กำลังโหลดข้อมูล...</span></div></div>)}
        
        {!isDataLoading && (
          <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-8">
            <FormSection title="ข้อมูลส่วนตัว" icon={FaUser}>
              <div><label className="form-label">คำนำหน้า *</label><CustomDropdown options={titleOptions} value={formData.title} onChange={(value) => handleFormChange('title', value)} disabled={mutation.isPending} showSearch={false} /></div>
              <div><label className="form-label">ชื่อ *</label><input type="text" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
              <div><label className="form-label">นามสกุล</label><input type="text" value={formData.lastName} onChange={(e) => handleFormChange('lastName', e.target.value)} className={inputClassName} disabled={mutation.isPending} /></div>
              <div><label className="form-label">เลขบัตรฯ / พาสปอร์ต *</label><input type="text" value={formData.idCard} onChange={(e) => handleFormChange('idCard', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
              <div className="sm:col-span-2"><label className="form-label">เบอร์ติดต่อ *</label><input type="tel" value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
            </FormSection>

            <FormSection title="ข้อมูลรถ" icon={FaCar}>
              <div><label className="form-label">ประเภทการจอง *</label><CustomDropdown options={persTypeOptions} value={formData.personalType} onChange={(value) => handleFormChange('personalType', value)} disabled={mutation.isPending} showSearch={false} /></div>
              <div><label className="form-label">ประเภทรถ *</label><CustomDropdown options={carTypeOptions} value={formData.carType} onChange={(value) => handleFormChange('carType', value)} disabled={mutation.isPending} showSearch={false} /></div>
              <div className="sm:col-span-2"><label className="form-label">ยี่ห้อรถ *</label><CustomDropdown options={brandOptions} value={formData.carBrand} onChange={(value) => handleFormChange('carBrand', value)} disabled={mutation.isPending} /></div>
              <div className="sm:col-span-2"><label className="form-label">หมายเลขตัวถัง (VIN) *</label><input type="text" value={formData.carBody} onChange={(e) => handleFormChange('carBody', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
              <div><label className="form-label">จองหมวดอักษร *</label><input type="text" value={formData.wantedGroup} onChange={(e) => handleFormChange('wantedGroup', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
              <div><label className="form-label">เลขจอง *</label><input type="text" value={formData.wantedNo} onChange={(e) => handleFormChange('wantedNo', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
            </FormSection>

            <FormSection title="ข้อมูลทางการเงิน" icon={FaFileAlt}>
              <div><label className="form-label">ราคา *</label><input type="number" value={formData.amount} onChange={(e) => handleFormChange('amount', e.target.value)} className={inputClassName} required disabled={mutation.isPending} /></div>
              <div><label className="form-label">วันที่จอง *</label><CustomDatePicker value={formData.dateReserve} onChange={(value) => handleFormChange('dateReserve', value)} disabled={mutation.isPending}/></div>
              <div className="sm:col-span-2"><label className="form-label">สถานะ *</label><CustomDropdown options={statusOptions} value={formData.status} onChange={(value) => handleFormChange('status', value)} disabled={mutation.isPending} showSearch={false} /></div>
            </FormSection>
          </form>
        )}
        <div className="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button type="submit" onClick={handleSubmit} disabled={mutation.isPending || !isFormValid || isDataLoading} className="btn-primary flex items-center justify-center gap-2">
            {mutation.isPending ? (<><FaSpinner className="animate-spin" /><span>{buttonText}</span></>) : (<><FaSave /><span>{buttonText}</span></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;