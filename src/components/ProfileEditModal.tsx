// src/components/ProfileEditModal.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FaUser, FaTimes, FaSpinner, FaSave, FaCamera, FaTrash, FaUpload } from 'react-icons/fa';

import { updateProfile, uploadProfilePicture } from '@api/ApiCollection';
import { useAuth } from '@context/AuthContext';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showErrorToast } from '@utils/toastUtils';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  phone: string;
  address: string;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

/**
 * Component สำหรับแบ่ง Section ของฟอร์ม
 */
const FormSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode
}> = React.memo(({ title, icon: Icon, children }) => (
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
//                        MAIN COMPONENT
// ===================================================================

/**
 * Component Modal สำหรับแก้ไขข้อมูลส่วนตัวของผู้ใช้
 */
const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, checkAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormData: ProfileFormData = useMemo(() => ({
    firstName: '', lastName: '', nickName: '', email: '', phone: '', address: '',
  }), []);

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        nickName: (user as any)?.nickName || '',
        email: user.email || '',
        phone: (user as any)?.phone || user.username || '',
        address: (user as any)?.address || '',
      });
      setPreviewUrl((user as any)?.profilePicture || '');
      setSelectedFile(null);
    }
  }, [isOpen, user]);

  const profileMutation = useApiMutation({
    mutationFn: async (data: { profileData: ProfileFormData; imageFile: File | null }) => {
      if (data.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', data.imageFile);
        await uploadProfilePicture(uploadFormData);
      }
      return updateProfile(data.profileData);
    },
    queryKeyToInvalidate: ['profile'],
    successMessage: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
    onSuccessCallback: () => {
      checkAuth();
      onClose();
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showErrorToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl((user as any)?.profilePicture || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    const { firstName, email, phone } = formData;
    return firstName.trim() && email.trim() && phone.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    profileMutation.mutate({ profileData: formData, imageFile: selectedFile });
  }, [formData, isFormValid, selectedFile, profileMutation]);
  
  const handleClose = useCallback(() => {
    if (!profileMutation.isPending) {
      onClose();
    }
  }, [profileMutation.isPending, onClose]);

  const isMutating = profileMutation.isPending;
  const buttonText = useMemo(() => isMutating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง', [isMutating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-auto flex flex-col animate-fade-in max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">✏️ แก้ไขข้อมูลส่วนตัว</h2>
          <button onClick={handleClose} disabled={isMutating} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-8">
          <FormSection title="รูปโปรไฟล์" icon={FaCamera}>
            <div className="sm:col-span-2">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-card bg-gray-100 flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-gray-400 text-5xl" />
                    )}
                  </div>
                  {isMutating && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><FaSpinner className="text-white text-xl animate-spin" /></div>)}
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isMutating} className="btn-primary flex items-center gap-2">
                    <FaUpload /> <span>เลือกรูปใหม่</span>
                  </button>
                  {previewUrl && (
                    <button type="button" onClick={handleRemoveImage} disabled={isMutating} className="btn-secondary flex items-center gap-2">
                      <FaTrash /> <span>ลบรูป</span>
                    </button>
                  )}
                </div>
                {selectedFile && <p className="text-sm text-primary-dark">ไฟล์ที่เลือก: {selectedFile.name}</p>}
                <p className="text-xs text-gray-500 text-center">รองรับ: JPG, PNG, GIF, WEBP (สูงสุด 5MB)</p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileSelect} className="hidden" />
              </div>
            </div>
          </FormSection>
          <FormSection title="ข้อมูลส่วนตัว" icon={FaUser}>
            <div>
              <label className="form-label">ชื่อ *</label>
              <input type="text" name="firstName" placeholder="ระบุชื่อ" value={formData.firstName} onChange={handleInputChange} className="form-input" required disabled={isMutating} />
            </div>
            <div>
              <label className="form-label">นามสกุล</label>
              <input type="text" name="lastName" placeholder="ระบุนามสกุล" value={formData.lastName} onChange={handleInputChange} className="form-input" disabled={isMutating} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">ชื่อเล่น</label>
              <input type="text" name="nickName" placeholder="ระบุชื่อเล่น (ถ้ามี)" value={formData.nickName} onChange={handleInputChange} className="form-input" disabled={isMutating} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">อีเมล *</label>
              <input type="email" name="email" placeholder="ระบุอีเมล" value={formData.email} onChange={handleInputChange} className="form-input" required disabled={isMutating} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">เบอร์โทรศัพท์</label>
              <input type="tel" name="phone" placeholder="ระบุเบอร์โทรศัพท์" value={formData.phone} onChange={handleInputChange} className="form-input" disabled={isMutating} maxLength={10} />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">ที่อยู่</label>
              <textarea name="address" placeholder="ระบุที่อยู่ (ถ้ามี)" value={formData.address} onChange={handleInputChange} className="form-input resize-none" rows={3} disabled={isMutating} />
            </div>
          </FormSection>
        </form>
        <div className="flex justify-end items-center p-5 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
          <button type="submit" onClick={handleSubmit} disabled={isMutating || !isFormValid} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            {isMutating ? <FaSpinner className="animate-spin" /> : <FaSave />}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;