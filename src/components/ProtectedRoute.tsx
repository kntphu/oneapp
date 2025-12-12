// src/components/ProtectedRoute.tsx

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

// ===================================================================
//                        COMPONENT PROPS
// ===================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}


// ===================================================================
//                        SUB-COMPONENTS
// ===================================================================

/**
 * Component แสดงผลระหว่างที่กำลังตรวจสอบสิทธิ์การเข้าใช้งาน
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">กำลังตรวจสอบสิทธิ์</h3>
        <p className="text-sm text-gray-500">โปรดรอสักครู่...</p>
      </div>
    </div>
  </div>
);

/**
 * Component แสดงผลเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงหน้านั้นๆ
 */
const AccessDenied: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-card">
      <svg className="mx-auto h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
      <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
      <button onClick={onBack} className="btn-primary">
        กลับไปหน้าหลัก
      </button>
    </div>
  </div>
);


// ===================================================================
//                        PROTECTED ROUTE COMPONENT
// ===================================================================

/**
 * Component สำหรับป้องกันการเข้าถึง Route ที่ต้องการการยืนยันตัวตนและสิทธิ์
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * ตรวจสอบ Authentication เมื่อ component ถูก mount หากยังไม่ได้ทำ
   */
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth?.();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  /**
   * แสดง Loading Spinner ระหว่างการตรวจสอบ
   */
  if (isLoading) {
    return <LoadingSpinner />;
  }

  /**
   * หากไม่ได้ Login ให้ Redirect ไปยังหน้า Login
   */
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  /**
   * ตรวจสอบสิทธิ์การเข้าถึงตาม Role
   */
  if (requiredRole && user) {
    const userRole = user.role || user.userRole;
    const hasRequiredRole = userRole && (
      Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole
    );

    if (!hasRequiredRole) {
      return <AccessDenied onBack={() => navigate('/home')} />;
    }
  }

  /**
   * หากผ่านการตรวจสอบทั้งหมด ให้แสดง Child Component
   */
  return <>{children}</>;
};

export default ProtectedRoute;