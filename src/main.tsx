// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from '@/App';
import { AuthProvider } from '@context/AuthContext';
import { theme } from '@/theme';
import '@/global.css';

// ===================================================================
//                        QUERY CLIENT CONFIGURATION
// ===================================================================

/**
 * สร้างและกำหนดค่าเริ่มต้นสำหรับ QueryClient เพื่อจัดการ Cache และ API Calls
 * @returns {QueryClient} instance ของ QueryClient ที่กำหนดค่าแล้ว
 */
const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 นาที
        gcTime: 10 * 60 * 1000,   // 10 นาที
        retry: (failureCount, error: any) => {
          // ไม่ต้อง retry หาก API ตอบกลับด้วย status 404 หรือ 401
          if (error?.status === 404 || error?.status === 401) return false;
          return failureCount < 2; // Retry สูงสุด 2 ครั้งสำหรับ error อื่นๆ
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
};

const queryClient = createQueryClient();

// ===================================================================
//                        ROOT COMPONENT & RENDER
// ===================================================================

/**
 * Root Component ที่รวม Providers ทั้งหมดสำหรับแอปพลิเคชัน
 */
const RootApp: React.FC = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

/**
 * ฟังก์ชันสำหรับ Render แอปพลิเคชันลงใน DOM
 */
const renderApp = (): void => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Failed to find root element with id="root"');
    return;
  }

  ReactDOM.createRoot(rootElement).render(<RootApp />);
};

renderApp();