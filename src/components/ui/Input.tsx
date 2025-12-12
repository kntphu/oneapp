// src/components/ui/Input.tsx

import React, { forwardRef } from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ===================================================================
//                        INPUT COMPONENT
// ===================================================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const containerClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-1.5 ${containerClass}`}>
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border-2
              bg-white text-gray-900 placeholder:text-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-gray-200 hover:border-gray-300'}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-error' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
