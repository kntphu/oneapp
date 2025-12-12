// src/components/ui/Badge.tsx

import React from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

// ===================================================================
//                        BADGE COMPONENT
// ===================================================================

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
  icon,
}) => {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-error/10 text-error border-error/20',
    info: 'bg-info/10 text-info border-info/20',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${roundedClass}
        ${className}
      `}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
