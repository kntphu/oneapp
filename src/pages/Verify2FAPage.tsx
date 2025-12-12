// src/pages/Verify2FAPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { verify2FA } from '@api/ApiCollection';
import { showSuccessToast, showErrorToast } from '@utils/toastUtils';
import { FaShieldAlt } from 'react-icons/fa';

const OTP_EXPIRATION_SECONDS = 180;

const Verify2FAPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(OTP_EXPIRATION_SECONDS);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const userIdFromStorage = sessionStorage.getItem('2fa_user_id');

  const handleVerification = useCallback(async (verificationCode: string) => {
    if (isLoading || !userIdFromStorage) return;

    setIsLoading(true);
    try {
      const userIdAsNumber = parseInt(userIdFromStorage, 10);
      const response = await verify2FA({ userId: userIdAsNumber, code: verificationCode });

      if (response.status === 'success' && response.token) {
        setIsSuccess(true);
        showSuccessToast('ยืนยันตัวตนสำเร็จ กำลังเข้าสู่ระบบ...');
        
        sessionStorage.removeItem('2fa_user_id');
        localStorage.setItem('auth_token', response.token);
        await auth.checkAuth();
        navigate('/home');
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ';
      showErrorToast(errorMessage);
      setCode('');
      setIsLoading(false);
    }
  }, [auth, navigate, userIdFromStorage, isLoading]);

  useEffect(() => {
    if (code.length === 6) {
      handleVerification(code);
    }
  }, [code, handleVerification]);
  
  useEffect(() => {
    if (isSuccess) {
      return;
    }

    if (!userIdFromStorage) {
      showErrorToast('เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้สำหรับยืนยันตัวตน');
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setIsResendDisabled(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [userIdFromStorage, navigate, isSuccess]);

  const handleResendCode = async () => {
    alert('ฟังก์ชันส่งรหัสใหม่ยังไม่ได้เชื่อมต่อ API');
    setIsResendDisabled(true);
    setCountdown(OTP_EXPIRATION_SECONDS);
  };
  
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 space-y-6">
        <div className="text-center">
          <FaShieldAlt className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">ยืนยันการเข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-600">กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="otp-code" className="sr-only">รหัสยืนยัน</label>
            <input
              id="otp-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="form-input text-center text-3xl tracking-[0.5em] sm:tracking-[1em]"
              placeholder="------"
              disabled={isLoading}
            />
          </div>

          {code.length < 6 && (
            <div>
              <button
                type="button"
                onClick={() => handleVerification(code)}
                className="btn-primary w-full py-3"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          {countdown > 0 ? (
            <p>รหัสจะหมดอายุใน <span className="font-bold text-primary">{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</span> นาที</p>
          ) : (
            <p>
              ไม่ได้รับรหัส?{' '}
              <button
                onClick={handleResendCode}
                disabled={isResendDisabled}
                className="font-medium text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                ส่งรหัสอีกครั้ง
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify2FAPage;