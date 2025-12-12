// src/pages/Login.tsx

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';

import { useAuth } from '@context/AuthContext';
import { APP_CONFIG, STORAGE_KEYS } from '@/config';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { showInfoToast } from '@/utils/toastUtils';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface FormData {
  username: string;
  password: string;
}

interface BrandFeature {
  text: string;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

const BrandPanel: React.FC<{ features: BrandFeature[] }> = memo(({ features }) => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center p-12">
    <div className="max-w-md text-center">
      <img src="/icon.svg" alt="One Platform Logo" className="w-32 h-32 mx-auto mb-8" />
      <h1 className="text-4xl font-sans font-bold text-gray-900 mb-4">{APP_CONFIG.name}</h1>
      <p className="text-xl text-gray-600 leading-relaxed mb-8">ระบบบริหารจัดการ | จองเลขทะเบียนรถ</p>
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={`feature-${index}`} className="flex items-center justify-center space-x-2 text-gray-700">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
));
BrandPanel.displayName = 'BrandPanel';

// ===================================================================
//                        LOGIN PAGE COMPONENT
// ===================================================================

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = useMemo(() => (location.state as { from?: { pathname: string } })?.from?.pathname || '/', [location.state]);
  const brandFeatures = useMemo(() => [
    { text: 'ลงทะเบียนจองเลขทะเบียนรถ' },
    { text: 'คำนวณผลรวมเลขทะเบียนรถ' },
    { text: 'ตารางจองเลขทะเบียนรถ' },
  ], []);

  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.form.savedUsername);
    const savedRememberMe = localStorage.getItem(STORAGE_KEYS.form.rememberMe) === 'true';
    
    if (savedUsername && savedRememberMe) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleRememberMe = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked), []);

  const isFormValid = useMemo(() => formData.username.trim() && formData.password.trim(), [formData]);

  // --- [!! โค้ดที่แก้ไข !!] Logic ของ handleSubmit ทั้งหมด ---
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.form.savedUsername, formData.username.trim());
        localStorage.setItem(STORAGE_KEYS.form.rememberMe, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.form.savedUsername);
        localStorage.removeItem(STORAGE_KEYS.form.rememberMe);
      }

      const response = await login({
        username: formData.username.trim(),
        password: formData.password,
      });
      
      if (response && response.status === '2fa_required') {
        showInfoToast('รหัสยืนยันถูกส่งไปยังอีเมลของคุณแล้ว');
        
        // [แก้ไข] 1. เก็บ userId ลงใน sessionStorage ก่อนเปลี่ยนหน้า
        sessionStorage.setItem('2fa_user_id', response.userId);
        
        // [แก้ไข] 2. นำทางไปหน้า verify-2fa โดยไม่ต้องส่ง state
        navigate('/verify-2fa');

      } else {
        throw new Error('Invalid response from server during login.');
      }
    } catch (error) {
      console.error('Login process failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, login, rememberMe, navigate]);
  // --- [!! สิ้นสุดส่วนที่แก้ไข !!] ---

  if (isLoading) return <LoadingSpinner message="กำลังตรวจสอบ..." />;
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="min-h-screen bg-white flex">
      <BrandPanel features={brandFeatures} />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="lg:hidden text-center">
            <img src="/icon.svg" alt="One Platform Logo" className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-2xl font-sans font-bold text-gray-900">{APP_CONFIG.name}</h1>
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-sans font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
            <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งาน</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">ชื่อผู้ใช้</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-custom-ease"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">รหัสผ่าน</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ease-custom-ease"
                  placeholder="กรอกรหัสผ่าน"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword
                    ? <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                    : <FaEye className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={toggleRememberMe}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">จดจำการเข้าสู่ระบบ</label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="btn-primary w-full flex justify-center py-4 px-6 rounded-xl text-base"
              >
                {isSubmitting
                  ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      กำลังเข้าสู่ระบบ...
                    </div>
                  )
                  : 'เข้าสู่ระบบ'
                }
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>Version {APP_CONFIG.version}</p>
            <p className="mt-1">© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;