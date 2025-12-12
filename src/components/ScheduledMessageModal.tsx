// src/components/ScheduledMessageModal.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaTimes, FaSpinner, FaPaperPlane, FaSearch, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

import type { ScheduledMessage } from '@api/types';
import type { LineUser } from '@api/ApiLineOA';
import { createScheduledMessage, updateScheduledMessage } from '@api/ApiLineOA';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showWarningToast } from '@utils/toastUtils';
import { CustomDatePicker } from '@components/common/CustomDatePicker';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface ScheduledMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  existingMessage?: ScheduledMessage | null;
  linkedUsers: LineUser[];
}

// ===================================================================
//                        HELPER FUNCTION
// ===================================================================

/**
 * สร้างค่าเวลาเริ่มต้นสำหรับ input (10 นาทีจากปัจจุบัน)
 */
const getLocalDateTimeForInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// ===================================================================
//                        MAIN COMPONENT
// ===================================================================

const ScheduledMessageModal: React.FC<ScheduledMessageModalProps> = ({ isOpen, onClose, mode, existingMessage, linkedUsers }) => {
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // แยกส่วนของ Date และ Time สำหรับ UI โดยเฉพาะ
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && existingMessage) {
        setMessage(existingMessage.message);
        const localDateTime = getLocalDateTimeForInput(new Date(existingMessage.scheduledAt));
        setScheduledAt(localDateTime);
        setDatePart(localDateTime.split('T')[0]);
        setTimePart(localDateTime.split('T')[1]);
        setSelectedUserIds(existingMessage.recipients.map(r => r.user.id));
      } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        const initialDateTime = getLocalDateTimeForInput(now);
        setMessage('');
        setScheduledAt(initialDateTime);
        setDatePart(initialDateTime.split('T')[0]);
        setTimePart(initialDateTime.split('T')[1]);
        setSelectedUserIds([]);
        setSearchTerm('');
      }
    }
  }, [isOpen, mode, existingMessage]);

  const filteredUsers = useMemo(() => {
    if (!linkedUsers) return [];
    return linkedUsers.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [linkedUsers, searchTerm]);

  const handleDateChange = useCallback((newDate: string) => {
    setDatePart(newDate);
    setScheduledAt(`${newDate}T${timePart}`);
  }, [timePart]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimePart(newTime);
    setScheduledAt(`${datePart}T${newTime}`);
  }, [datePart]);

  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allVisibleIds = filteredUsers.map(u => u.id);
    const allVisibleSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedUserIds.includes(id));
    if (allVisibleSelected) {
      setSelectedUserIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  }, [filteredUsers, selectedUserIds]);

  const createMutation = useApiMutation({
    mutationFn: createScheduledMessage,
    queryKeyToInvalidate: ['scheduledMessages'],
    successMessage: 'ตั้งเวลาส่งข้อความสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการตั้งเวลา',
    onSuccessCallback: onClose,
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: { message: string, scheduledAt: string, recipientUserIds: string[] }) => {
      if (!existingMessage) throw new Error('No message to update');
      return updateScheduledMessage(existingMessage.id, data);
    },
    queryKeyToInvalidate: ['scheduledMessages'],
    successMessage: 'อัปเดตข้อความสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการอัปเดต',
    onSuccessCallback: onClose,
  });

  const isFormValid = useMemo(() => {
    const isDateTimeValid = new Date(scheduledAt) > new Date();
    return message.trim() && scheduledAt && selectedUserIds.length > 0 && isDateTimeValid;
  }, [message, scheduledAt, selectedUserIds]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (new Date(scheduledAt) <= new Date()) {
        showWarningToast('กรุณาตั้งเวลาล่วงหน้า');
      } else {
        showWarningToast('กรุณากรอกข้อมูลให้ครบถ้วนและเลือกผู้รับอย่างน้อย 1 คน');
      }
      return;
    }
    const utcDate = new Date(scheduledAt).toISOString();
    const payload = { message, scheduledAt: utcDate, recipientUserIds: selectedUserIds };
    
    if (mode === 'add') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  }, [isFormValid, mode, message, scheduledAt, selectedUserIds, createMutation, updateMutation]);

  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 p-4 overflow-y-auto transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-auto flex flex-col max-h-[90vh] animate-fade-in">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold font-sans text-gray-900">{mode === 'add' ? 'ตั้งเวลาส่งข้อความใหม่' : 'แก้ไขข้อความ'}</h2>
          <button onClick={onClose} disabled={isMutating} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="message" className="form-label">ข้อความ *</label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="พิมพ์ข้อความที่ต้องการส่ง..." className="form-input min-h-[120px]" required disabled={isMutating} />
          </div>
          <div className="space-y-2">
            <label className="form-label">ตั้งเวลาส่ง *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDatePicker value={datePart} onChange={handleDateChange} disabled={isMutating} />
              <input type="time" value={timePart} onChange={handleTimeChange} className="form-input" required disabled={isMutating} />
            </div>
            <p className="text-xs text-gray-500 mt-1">เวลาจะถูกส่งตามเวลาประเทศไทย (UTC+7)</p>
          </div>
          <div className="space-y-3">
            <label className="form-label">เลือกผู้รับ ({selectedUserIds.length} คน) *</label>
            <div className="relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="ค้นหาชื่อผู้ใช้..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleSelectAll} className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                {filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id)) ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
              {linkedUsers.length > 0 ? (
                filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <div key={user.id} onClick={() => handleUserSelect(user.id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUserIds.includes(user.id) ? 'bg-primary/10' : 'hover:bg-gray-100'}`}>
                    <img src={user.pictureUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1 text-sm font-medium text-gray-800">{user.displayName}</span>
                    {selectedUserIds.includes(user.id) ? <FaCheckCircle className="text-primary" /> : <FaRegCircle className="text-gray-300" />}
                  </div>
                )) : <p className="text-center text-sm text-gray-500 py-4">ไม่พบผลการค้นหา</p>
              ) : <p className="text-center text-sm text-gray-500 py-4">ไม่พบผู้ใช้ที่เชื่อมโยงกับลูกค้า</p>}
            </div>
          </div>
        </form>
        <div className="flex justify-end items-center p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button type="submit" onClick={handleSubmit} disabled={isMutating || !isFormValid} className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {isMutating ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            <span>{mode === 'add' ? 'ตั้งเวลาส่ง' : 'บันทึกการแก้ไข'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledMessageModal;