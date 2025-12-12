// src/components/ChangePasswordModal.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { FaLock, FaTimes, FaSpinner, FaEye, FaEyeSlash, FaKey, FaShieldAlt } from 'react-icons/fa';

import { useAuth } from '@context/AuthContext';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { changePassword } from '@api/ApiCollection';
import { showSuccessToast } from '@utils/toastUtils';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===================================================================
//                        MAIN COMPONENT
// ===================================================================

/**
 * Component Modal สำหรับให้ผู้ใช้เปลี่ยนรหัสผ่าน
 */
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const initialFormData: PasswordFormData = { oldPassword: '', newPassword: '', confirmPassword: '' };
  const initialShowPasswords = { old: false, new: false, confirm: false };

  const [formData, setFormData] = useState<PasswordFormData>(initialFormData);
  const [showPasswords, setShowPasswords] = useState(initialShowPasswords);

  const mutation = useApiMutation({
    mutationFn: changePassword,
    queryKeyToInvalidate: ['profile'],
    successMessage: 'เปลี่ยนรหัสผ่านสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
    onSuccessCallback: () => {
      showSuccessToast('กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      handleClose();
      setTimeout(() => logout(), 2000);
    },
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const getPasswordStrength = useMemo(() => {
    const password = formData.newPassword;
    if (!password) return { score: 0, text: '', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, text: 'อ่อน', color: 'error' };
    if (score <= 3) return { score, text: 'ปานกลาง', color: 'warning' };
    return { score, text: 'แข็งแกร่ง', color: 'success' };
  }, [formData.newPassword]);

  const isFormValid = useMemo(() => {
    const { oldPassword, newPassword, confirmPassword } = formData;
    return oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      mutation.mutate({ oldPassword: formData.oldPassword, newPassword: formData.newPassword });
    }
  }, [formData, isFormValid, mutation]);

  const handleClose = useCallback(() => {
    if (!mutation.isPending) {
      setFormData(initialFormData);
      setShowPasswords(initialShowPasswords);
      onClose();
    }
  }, [mutation.isPending, onClose]);

  const buttonText = useMemo(() => mutation.isPending ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน', [mutation.isPending]);

  if (!isOpen) return null;

  const strength = getPasswordStrength;
  const passwordStrengthColor = {
    error: 'bg-error',
    warning: 'bg-warning',
    success: 'bg-success',
    gray: 'bg-gray-200'
  }[strength.color];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-auto flex flex-col animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FaKey className="text-primary-dark text-lg" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h2>
          </div>
          <button onClick={handleClose} disabled={mutation.isPending} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="form-label flex items-center gap-2"><FaLock /><span>รหัสผ่านปัจจุบัน *</span></label>
            <div className="relative">
              <input type={showPasswords.old ? "text" : "password"} name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} className="form-input pr-12" required disabled={mutation.isPending} />
              <button type="button" onClick={() => togglePasswordVisibility('old')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={mutation.isPending}>{showPasswords.old ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
          </div>
          <div>
            <label className="form-label flex items-center gap-2"><FaShieldAlt /><span>รหัสผ่านใหม่ *</span></label>
            <div className="relative">
              <input type={showPasswords.new ? "text" : "password"} name="newPassword" placeholder="อย่างน้อย 6 ตัวอักษร" value={formData.newPassword} onChange={handleInputChange} className="form-input pr-12" required disabled={mutation.isPending} minLength={6} />
              <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={mutation.isPending}>{showPasswords.new ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            {formData.newPassword && (
              <div className="mt-2 text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-600">ความแข็งแกร่ง:</span>
                    <span className={`font-medium text-${strength.color}`}>{strength.text}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrengthColor}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="form-label flex items-center gap-2"><FaShieldAlt /><span>ยืนยันรหัสผ่านใหม่ *</span></label>
            <div className="relative">
              <input type={showPasswords.confirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="form-input pr-12" required disabled={mutation.isPending} />
              <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={mutation.isPending}>{showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-error mt-1">รหัสผ่านไม่ตรงกัน</p>
            )}
          </div>
        </form>
        <div className="flex flex-col sm:flex-row justify-end items-center p-6 border-t bg-gray-50 rounded-b-xl gap-3">
          <button 
            type="button" 
            onClick={handleClose} 
            disabled={mutation.isPending} 
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
          >
            <FaTimes />
            <span>ยกเลิก</span>
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={mutation.isPending || !isFormValid} 
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
          >
            {mutation.isPending ? <FaSpinner className="animate-spin" /> : <FaKey />}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;