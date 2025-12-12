// src/utils/hooks/useResponsive.ts

import { useState, useEffect, useCallback } from 'react';
import { UI_CONFIG } from '@/config';

// ===================================================================
//                        INTERFACE DEFINITION
// ===================================================================

/**
 * Interface สำหรับข้อมูลเกี่ยวกับอุปกรณ์ที่ใช้งาน
 */
interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
}

// ===================================================================
//                        HELPER FUNCTION
// ===================================================================

let deviceInfoCache: DeviceInfo | null = null;
let lastScreenWidth = 0;

/**
 * ตรวจจับคุณสมบัติของอุปกรณ์โดยอิงจากความกว้างของหน้าจอและ User Agent
 * ใช้ Caching เพื่อประสิทธิภาพที่ดีขึ้น
 * @returns {DeviceInfo} - Object ที่มีข้อมูลเกี่ยวกับอุปกรณ์
 */
const detectDevice = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1920,
      isTouchDevice: false,
      orientation: 'landscape',
    };
  }

  const currentWidth = window.innerWidth;

  // คืนค่าจาก Cache หากความกว้างหน้าจอไม่เปลี่ยนแปลงมากนัก
  if (deviceInfoCache && Math.abs(currentWidth - lastScreenWidth) < 50) {
    return deviceInfoCache;
  }

  const userAgent = navigator.userAgent || navigator.vendor || '';
  const isMobileDeviceUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  const newDeviceInfo: DeviceInfo = {
    isMobile: isMobileDeviceUA || currentWidth <= UI_CONFIG.breakpoints.tablet,
    isTablet: !isMobileDeviceUA && currentWidth > UI_CONFIG.breakpoints.tablet && currentWidth <= UI_CONFIG.breakpoints.desktop,
    isDesktop: !isMobileDeviceUA && currentWidth > UI_CONFIG.breakpoints.desktop,
    screenWidth: currentWidth,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
  };

  // อัปเดต Cache
  deviceInfoCache = newDeviceInfo;
  lastScreenWidth = currentWidth;

  return newDeviceInfo;
};

// ===================================================================
//                        CUSTOM HOOK
// ===================================================================

/**
 * Custom Hook สำหรับดึงข้อมูลอุปกรณ์แบบ Responsive
 * จะทำการอัปเดต Component เมื่อขนาดหน้าจอมีการเปลี่ยนแปลงข้าม Breakpoint ที่กำหนดไว้
 * @returns {DeviceInfo} - Object ที่มี boolean flags สำหรับ mobile, tablet, และ desktop
 */
export const useResponsive = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice);

  const handleResize = useCallback(() => {
    const newDevice = detectDevice();
    // อัปเดต state ก็ต่อเมื่อประเภทของอุปกรณ์ (mobile/tablet/desktop) เปลี่ยนแปลง
    if (
      newDevice.isMobile !== deviceInfo.isMobile ||
      newDevice.isTablet !== deviceInfo.isTablet ||
      newDevice.isDesktop !== deviceInfo.isDesktop
    ) {
      setDeviceInfo(newDevice);
    }
  }, [deviceInfo]);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, UI_CONFIG.performance.debounceDelay);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [handleResize]);

  return deviceInfo;
};