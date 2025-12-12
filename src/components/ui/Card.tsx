// src/components/ui/Card.tsx

import React from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

// ===================================================================
//                        CARD COMPONENT
// ===================================================================

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
  hoverable = false,
  padding = 'md',
  onClick,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const hoverClass = hoverable
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-gray-100 transition-all duration-300 animate-fade-in ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {header && (
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
