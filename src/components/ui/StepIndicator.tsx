// src/components/ui/StepIndicator.tsx

import React from 'react';
import { FiCheck } from 'react-icons/fi';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
  position?: 'left' | 'right';
  className?: string;
}

// ===================================================================
//                        STEP INDICATOR COMPONENT
// ===================================================================

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  label,
  active,
  completed,
  position = 'right',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${position === 'left' ? 'flex-row-reverse' : ''} ${className}`}>
      <div
        className={`
          flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
          transition-all duration-300
          ${
            active
              ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
              : completed
              ? 'bg-success text-white'
              : 'bg-gray-200 text-gray-500'
          }
        `}
        aria-label={`ขั้นตอนที่ ${step}: ${label}`}
      >
        {completed ? <FiCheck className="h-4 w-4" /> : step}
      </div>
      <span
        className={`
          text-xs font-medium hidden sm:block transition-colors
          ${
            active
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {label}
      </span>
    </div>
  );
};

export default StepIndicator;
