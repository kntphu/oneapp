// src/components/MainLayout.tsx

import React, { useCallback, useEffect, useState, memo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import TopBar from '@components/TopBar';

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

/**
 * Component ปุ่มสำหรับเลื่อนกลับไปด้านบนสุดของหน้า
 */
const ScrollToTopButton: React.FC<{ isVisible: boolean }> = memo(({ isVisible }) => {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all duration-300 hover:bg-primary-dark hover:scale-110"
      aria-label="Scroll to top"
    >
      <FaArrowUp className="h-5 w-5" />
    </button>
  );
});
ScrollToTopButton.displayName = 'ScrollToTopButton';

// ===================================================================
//                        MAIN LAYOUT COMPONENT
// ===================================================================

/**
 * Component โครงสร้างหลักของหน้าเว็บ (Layout) ที่แสดงผลหลังจากการ Login
 */
const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const getActiveView = useCallback((): string => {
    const pathSegment = location.pathname.split('/')[1];
    return pathSegment || 'home';
  }, [location.pathname]);

  const handleViewChange = useCallback((view: string) => {
    navigate(`/${view}`);
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar 
        activeView={getActiveView()} 
        onViewChange={handleViewChange} 
      />
      
      <main className="animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      <ScrollToTopButton isVisible={isScrolled} />
    </div>
  );
};

export default MainLayout;