// src/components/TopBar.tsx

import React, { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSignOutAlt, FaChartLine, FaUsers, FaCalendarAlt,
  FaHistory, FaCogs, FaChevronDown, FaEdit,
  FaKey, FaBars, FaTimes, FaCalculator, FaLine
} from 'react-icons/fa';

import { useAuth } from '@context/AuthContext';
import { APP_CONFIG } from '@/config';
import { useClickOutside } from '@utils/hooks/useClickOutside';
import ProfileEditModal from '@components/ProfileEditModal';
import ChangePasswordModal from '@components/ChangePasswordModal';
import ProfileAvatar from '@components/ProfileAvatar';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface TopBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

const NavMenuItem: React.FC<{
  item: MenuItem;
  isActive: boolean;
  onClick: (id: string) => void;
  variant?: 'desktop' | 'tablet' | 'mobile' | 'dropdown';
}> = memo(({ item, isActive, onClick, variant = 'desktop' }) => {

  const baseClasses = "w-full text-left transition-colors duration-200";
  const activeClasses = "bg-primary/10 text-primary-dark";
  const inactiveClasses = "text-gray-700 hover:bg-gray-100";

  switch (variant) {
    case 'tablet':
      return (
        <button
          onClick={() => onClick(item.id)}
          className={`p-2 rounded-lg ${isActive ? activeClasses : inactiveClasses}`}
          title={item.description}
          aria-label={item.label}
        >
          <item.icon className="w-5 h-5" />
        </button>
      );
    case 'mobile':
    case 'dropdown':
      return (
        <button
          onClick={() => onClick(item.id)}
          className={`${baseClasses} rounded-lg px-3 py-2.5 flex items-center gap-3 ${isActive ? activeClasses : inactiveClasses}`}
        >
          <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-dark' : 'text-gray-500'}`} />
          <div>
            <span className="font-medium text-sm text-gray-800">{item.label}</span>
            <p className="text-xs text-gray-500 font-normal">{item.description}</p>
          </div>
        </button>
      );
    default: // Desktop
      return (
        <button
          onClick={() => onClick(item.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive ? activeClasses + ' shadow-sm' : inactiveClasses}`}
          title={item.description}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </button>
      );
  }
});
NavMenuItem.displayName = 'NavMenuItem';

// ===================================================================
//                        TOPBAR COMPONENT
// ===================================================================

const TopBar: React.FC<TopBarProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<'profile' | 'mobile' | 'tabletMore' | null>(null);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setOpenMenu(null));

  const menuItems: MenuItem[] = useMemo(() => [
    { id: 'home', label: 'ภาพรวม', icon: FaChartLine, description: 'ดูภาพรวมทั้งหมด' },
    { id: 'customers', label: 'ลูกค้า', icon: FaUsers, description: 'จัดการข้อมูลลูกค้า' },
    { id: 'calendar', label: 'ปฏิทิน', icon: FaCalendarAlt, description: 'นัดหมายและกิจกรรม' },
    { id: 'plates-info', label: 'ทะเบียนรถ', icon: FaCalculator, description: 'คำนวณป้ายทะเบียน' },
    { id: 'logs', label: 'กิจกรรม', icon: FaHistory, description: 'ประวัติการใช้งานและเหตุการณ์' },
    { id: 'line-oa', label: 'ข้อมูล Line OA', icon: FaLine, description: 'บริหารจัดการ Line OA' },
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: FaCogs, description: 'ตั้งค่าระบบ' }
  ], []);

  const tabletMenuItems = useMemo(() => menuItems.slice(0, 4), [menuItems]);
  const tabletMoreMenuItems = useMemo(() => menuItems.slice(4), [menuItems]);

  const handleMenuItemClick = useCallback((itemId: string) => {
    onViewChange(itemId);
    setOpenMenu(null);
  }, [onViewChange]);

  const toggleMenu = (menu: 'profile' | 'mobile' | 'tabletMore') => {
    setOpenMenu(prev => (prev === menu ? null : menu));
  };
  
  const displayName = useMemo(() => user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.name || user?.username || 'ผู้ใช้', [user]);
  const displayEmail = useMemo(() => user?.email || user?.username || '', [user]);

  return (
    <>
      <ProfileEditModal isOpen={showProfileEditModal} onClose={() => setShowProfileEditModal(false)} />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />

      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" ref={menuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center gap-4">
              <Link to="/home" className="flex items-center gap-3 flex-shrink-0">
                <img src="/icon.svg" alt="One Platform Logo" className="w-10 h-10" />
                <span className="text-xl font-bold font-sans text-gray-900 hidden sm:block">{APP_CONFIG.name}</span>
              </Link>
              <nav className="hidden xl:flex items-center space-x-1">
                {menuItems.map(item => <NavMenuItem key={item.id} item={item} isActive={activeView === item.id} onClick={handleMenuItemClick} />)}
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex xl:hidden items-center space-x-1">
                {tabletMenuItems.map(item => <NavMenuItem key={item.id} item={item} isActive={activeView === item.id} onClick={handleMenuItemClick} variant="tablet" />)}
                <div className="relative">
                  <button onClick={() => toggleMenu('tabletMore')} aria-expanded={openMenu === 'tabletMore'} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="เมนูเพิ่มเติม">
                    <FaBars className="w-5 h-5" />
                  </button>
                  {openMenu === 'tabletMore' && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border p-2 space-y-1 animate-fade-in">
                      {tabletMoreMenuItems.map(item => <NavMenuItem key={item.id} item={item} isActive={activeView === item.id} onClick={handleMenuItemClick} variant="dropdown" />)}
                    </div>
                  )}
                </div>
              </nav>

              <div className="relative">
                <button onClick={() => toggleMenu('profile')} aria-expanded={openMenu === 'profile'} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                  <ProfileAvatar size="md" />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{displayEmail}</p>
                  </div>
                  <FaChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openMenu === 'profile' ? 'rotate-180' : ''}`} />
                </button>
                {openMenu === 'profile' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b flex items-center gap-3">
                      <ProfileAvatar size="lg" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{displayName}</p>
                        <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                      </div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setShowProfileEditModal(true); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"><FaEdit /><span>แก้ไขข้อมูลส่วนตัว</span></button>
                      <button onClick={() => { setShowChangePasswordModal(true); setOpenMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"><FaKey /><span>เปลี่ยนรหัสผ่าน</span></button>
                    </div>
                    <div className="border-t my-1"></div>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-3"><FaSignOutAlt /><span>ออกจากระบบ</span></button>
                  </div>
                )}
              </div>
              
              <button onClick={() => toggleMenu('mobile')} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="เปิดเมนู">
                {openMenu === 'mobile' ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {openMenu === 'mobile' && (
          <div className="md:hidden bg-white border-t animate-fade-in">
            <nav className="p-2 space-y-1">
              {menuItems.map(item => <NavMenuItem key={item.id} item={item} isActive={activeView === item.id} onClick={handleMenuItemClick} variant="mobile" />)}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default TopBar;