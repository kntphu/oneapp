// src/App.tsx

import React, { Component, Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// ===================================================================
//                        LAZY-LOADED COMPONENTS
// ===================================================================

const Login = React.lazy(() => import('@pages/Login'));
const Verify2FAPage = React.lazy(() => import('@pages/Verify2FAPage')); // <-- เพิ่มบรรทัดนี้
const Home = React.lazy(() => import('@pages/Home'));
const CustomerPage = React.lazy(() => import('@pages/CustomerPage'));
const CalendarPage = React.lazy(() => import('@pages/CalendarPage'));
const LogsPage = React.lazy(() => import('@pages/LogsPage'));
const SettingsPage = React.lazy(() => import('@pages/SettingsPage'));
const PlatesInfo = React.lazy(() => import('@pages/PlatesInfo'));
const LineOAPage = React.lazy(() => import('@pages/LineOAPage'));
const MainLayout = React.lazy(() => import('@components/MainLayout'));
const ProtectedRoute = React.lazy(() => import('@components/ProtectedRoute'));


// ===================================================================
//                        FALLBACK COMPONENTS
// ===================================================================

/**
 * Component แสดงผลระหว่างที่กำลังโหลดหน้า (Suspense fallback)
 */
const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">กำลังโหลด...</h3>
        <p className="text-sm text-gray-600">โปรดรอสักครู่</p>
      </div>
    </div>
  </div>
);

/**
 * Component แสดงผลเมื่อเกิด Error ใน Error Boundary
 */
const ErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
      <p className="text-gray-600 mb-4">{error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}</p>
      <button
        onClick={resetError}
        className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors duration-300"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  </div>
);

// ===================================================================
//                        ERROR BOUNDARY COMPONENT
// ===================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary สำหรับดักจับ Error ที่เกิดขึ้นใน Child Components
 */
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}


// ===================================================================
//                        MAIN APP COMPONENT
// ===================================================================

/**
 * Array ของ Route ที่ต้องการการยืนยันตัวตน (Protected Routes)
 */
const protectedRoutes = [
  { path: '/home', element: <Home /> },
  { path: '/dashboard', element: <Navigate to="/home" replace /> },
  { path: '/customers', element: <CustomerPage /> },
  { path: '/plates-info', element: <PlatesInfo /> },
  { path: '/calendar', element: <CalendarPage /> },
  { path: '/line-oa', element: <LineOAPage /> },
  { path: '/logs', element: <LogsPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/', element: <Navigate to="/home" replace /> },
];

/**
 * การตั้งค่าสำหรับ React Toastify
 */
const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light" as const,
};

/**
 * Component หลักของแอปพลิเคชันที่จัดการ Routing ทั้งหมด
 */
const App: React.FC = () => {
  const routes = useMemo(() => (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify-2fa" element={<Verify2FAPage />} /> {/* <-- เพิ่มบรรทัดนี้ */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  ), []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<PageLoadingSpinner />}>
        {routes}
      </Suspense>
      <ToastContainer {...toastConfig} />
    </ErrorBoundary>
  );
};

export default App;