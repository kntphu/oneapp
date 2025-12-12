// src/pages/Login.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaShieldAlt } from 'react-icons/fa';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';

import { useAuth } from '@context/AuthContext';
import { verify2FA } from '@api/ApiCollection';
import { APP_CONFIG, STORAGE_KEYS } from '@/config';
import { InputOTP, StepIndicator, Button } from '@components/ui';
import { showInfoToast, showSuccessToast, showErrorToast } from '@/utils/toastUtils';

// ===================================================================
//                        CONSTANTS
// ===================================================================

const OTP_EXPIRATION_SECONDS = 180;
const OTP_USERNAME_KEY = 'otp_username';
const OTP_EXPIRES_AT_KEY = 'otp_expires_at';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface FormData {
  username: string;
  password: string;
}

type LoginStatus = 'credentials' | 'otp';

// ===================================================================
//                        LOGIN PAGE COMPONENT
// ===================================================================

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<LoginStatus>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [otpUsername, setOtpUsername] = useState<string>('');
  const [isExiting, setIsExiting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const { login, isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = useMemo(() => (location.state as { from?: { pathname: string } })?.from?.pathname || '/home', [location.state]);
  const isOtpStep = status === 'otp';
  const displayUsername = formData.username || otpUsername;

  // ==================== EFFECTS ====================

  // Load saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.form.savedUsername);
    const savedRememberMe = localStorage.getItem(STORAGE_KEYS.form.rememberMe) === 'true';
    const savedOtpUsername = localStorage.getItem(OTP_USERNAME_KEY);

    if (savedUsername && savedRememberMe) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }

    if (savedOtpUsername) {
      setOtpUsername(savedOtpUsername);
    }
  }, []);

  // OTP Timer
  useEffect(() => {
    if (!isOtpStep) {
      setOtpSecondsLeft(0);
      return;
    }

    const expiresAtRaw = localStorage.getItem(OTP_EXPIRES_AT_KEY);
    if (expiresAtRaw) {
      const expiresAt = Number(expiresAtRaw);
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setOtpSecondsLeft(diff);
    } else {
      setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
    }
  }, [isOtpStep]);

  useEffect(() => {
    if (!isOtpStep || otpSecondsLeft <= 0) return;

    const intervalId = window.setInterval(() => {
      setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOtpStep, otpSecondsLeft]);

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Auto verify OTP when complete
  useEffect(() => {
    if (otpCode.length === 6 && userId) {
      handleVerifyOtp();
    }
  }, [otpCode, userId]);

  // ==================== HANDLERS ====================

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const togglePasswordVisibility = useCallback(() => setShowPassword(prev => !prev), []);
  const toggleRememberMe = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked), []);

  const isFormValid = useMemo(() => formData.username.trim() && formData.password.trim(), [formData]);

  const handleSubmitCredentials = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setIsExiting(true);

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

        // Save userId and username
        setUserId(response.userId);
        localStorage.setItem(OTP_USERNAME_KEY, formData.username.trim());
        const expiresAt = Date.now() + OTP_EXPIRATION_SECONDS * 1000;
        localStorage.setItem(OTP_EXPIRES_AT_KEY, expiresAt.toString());

        // Switch to OTP step
        setIsExiting(false);
        setStatus('otp');
      }
    } catch (error) {
      console.error('Login process failed:', error);
      setIsExiting(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, isSubmitting, login, rememberMe]);

  const handleVerifyOtp = useCallback(async () => {
    if (isSubmitting || !userId || otpCode.length !== 6) return;

    setIsSubmitting(true);
    try {
      const response = await verify2FA({ userId, code: otpCode });

      if (response.status === 'success' && response.token) {
        showSuccessToast('ยืนยันตัวตนสำเร็จ กำลังเข้าสู่ระบบ...');

        // Clear OTP data
        localStorage.removeItem(OTP_USERNAME_KEY);
        localStorage.removeItem(OTP_EXPIRES_AT_KEY);
        sessionStorage.removeItem('2fa_user_id');

        // Save token and check auth
        localStorage.setItem(STORAGE_KEYS.auth.token, response.token);
        await checkAuth();
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ';
      showErrorToast(errorMessage);
      setOtpCode('');
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, otpCode, isSubmitting, checkAuth]);

  const handleResendOtp = useCallback(async () => {
    if (isSubmitting || otpSecondsLeft > 0 || !formData.username || !formData.password) return;

    setIsSubmitting(true);
    try {
      const response = await login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response && response.status === '2fa_required') {
        showInfoToast('ส่งรหัสยืนยันใหม่แล้ว');
        const expiresAt = Date.now() + OTP_EXPIRATION_SECONDS * 1000;
        localStorage.setItem(OTP_EXPIRES_AT_KEY, expiresAt.toString());
        setOtpSecondsLeft(OTP_EXPIRATION_SECONDS);
        setOtpCode('');
      }
    } catch (error) {
      console.error('Resend OTP failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, otpSecondsLeft, login]);

  // ==================== HELPERS ====================

  const formatOtpTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-600">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/icon.svg"
                  alt={APP_CONFIG.name}
                  className="h-16 w-16 rounded-2xl shadow-lg"
                  loading="eager"
                  width="64"
                  height="64"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{APP_CONFIG.name}</h1>
              <p className="text-sm text-gray-600">ระบบจัดการข้อมูลจองเลขทะเบียนรถ</p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-2">
              <FaShieldAlt className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-gray-700">
                การเชื่อมต่อปลอดภัย SSL
              </span>
            </div>

            {/* Step Progress */}
            <div className="flex items-center gap-2">
              <StepIndicator
                step={1}
                label="เข้าสู่ระบบ"
                active={!isOtpStep}
                completed={isOtpStep}
              />
              <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: isOtpStep ? '100%' : '0%' }}
                />
              </div>
              <StepIndicator
                step={2}
                label="ยืนยัน OTP"
                active={isOtpStep}
                completed={false}
              />
            </div>
          </div>

          {/* Forms Content */}
          <div className="px-8 pb-8">
            <div className="relative min-h-[320px]">
              {/* Credentials Form */}
              {!isOtpStep && (
                <div className={isExiting ? 'animate-fade-out' : 'animate-fade-in-up'}>
                  <form onSubmit={handleSubmitCredentials} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          required
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          placeholder="กรอกชื่อผู้ใช้"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          placeholder="กรอกรหัสผ่าน"
                          value={formData.password}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                        >
                          {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={rememberMe}
                        onChange={toggleRememberMe}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        จดจำการเข้าสู่ระบบ
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      disabled={!isFormValid}
                      rightIcon={<FiArrowRight />}
                    >
                      {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                    </Button>
                  </form>
                </div>
              )}

              {/* OTP Form */}
              {isOtpStep && (
                <div className="animate-slide-in">
                  <div className="space-y-6">
                    {/* Username Display */}
                    {displayUsername && (
                      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm justify-center">
                        <FiMail className="h-4 w-4 text-primary" />
                        <span className="text-gray-600">
                          ส่งรหัส OTP ไปยัง{' '}
                          <span className="font-semibold text-gray-900">{displayUsername}</span>
                        </span>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div className="space-y-4">
                      <InputOTP
                        length={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={isSubmitting}
                        autoFocus
                      />

                      {/* Timer & Instructions */}
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          กรุณากรอกรหัส OTP ที่ได้รับทั้ง 6 หลัก
                        </p>
                        {otpSecondsLeft > 0 ? (
                          <p className="text-sm font-semibold text-primary">
                            รหัสจะหมดอายุใน <span className="tabular-nums">{formatOtpTime(otpSecondsLeft)}</span>
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-error">
                            รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Resend Button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting || otpSecondsLeft > 0}
                        className={`text-sm font-medium transition-colors ${
                          otpSecondsLeft > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-primary hover:text-primary-dark'
                        }`}
                      >
                        ขอรหัส OTP ใหม่
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={isSubmitting}
                      disabled={otpCode.length !== 6}
                      leftIcon={<FiCheck />}
                    >
                      {isSubmitting ? 'กำลังยืนยัน...' : 'ยืนยันและเข้าใช้งาน'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            เวอร์ชัน {APP_CONFIG.version} • ปรับปรุงล่าสุด {new Date().toLocaleDateString('th-TH')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
