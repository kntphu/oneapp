// src/components/common/CarTypeIcon.tsx

import React, { useMemo } from 'react';
import { FaCar, FaMotorcycle, FaTruck, FaShuttleVan } from 'react-icons/fa';
import { UI_CONFIG } from '@/config';
import type { CarTypeValue } from '@api/types';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface CarTypeIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

// ===================================================================
//                        CAR TYPE ICON COMPONENT
// ===================================================================

const CarTypeIcon: React.FC<CarTypeIconProps> = React.memo(({
  type,
  size = 'md',
  className = '',
  showTooltip = true
}) => {

  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm': return { container: 'w-6 h-6', icon: 'w-3 h-3' };
      case 'lg': return { container: 'w-12 h-12', icon: 'w-6 h-6' };
      default: return { container: 'w-8 h-8', icon: 'w-4 h-4' };
    }
  }, [size]);

  const iconConfig = useMemo(() => {
    const normalizedType = type?.toUpperCase() as CarTypeValue;
    switch (normalizedType) {
      case 'CAR':   return { Icon: FaCar, color: 'text-blue-500', bgColor: 'bg-blue-100', title: 'รถยนต์' };
      case 'MC':    return { Icon: FaMotorcycle, color: 'text-purple-500', bgColor: 'bg-purple-100', title: 'รถจักรยานยนต์' };
      case 'TRUCK': return { Icon: FaTruck, color: 'text-green-500', bgColor: 'bg-green-100', title: 'รถบรรทุก' };
      case 'VAN':   return { Icon: FaShuttleVan, color: 'text-orange-500', bgColor: 'bg-orange-100', title: 'รถตู้' };
      default:      return { Icon: FaCar, color: 'text-gray-400', bgColor: 'bg-gray-100', title: 'ไม่ระบุประเภท' };
    }
  }, [type]);

  const { Icon, color, bgColor, title } = iconConfig;
  const combinedClassName = `flex items-center justify-center rounded-lg ${bgColor} ${sizeConfig.container} ${className}`;

  return (
    <div
      className={combinedClassName}
      style={{
        transition: `all ${UI_CONFIG.animations.duration}ms ${UI_CONFIG.animations.easing}`
      }}
    >
      <Icon
        className={`${color} ${sizeConfig.icon}`}
        title={showTooltip ? title : undefined}
        aria-label={title}
      />
    </div>
  );
});

CarTypeIcon.displayName = 'CarTypeIcon';

export default CarTypeIcon;