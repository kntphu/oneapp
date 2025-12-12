// src/components/ui/Select.tsx

import React, { forwardRef } from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

// ===================================================================
//                        SELECT COMPONENT
// ===================================================================

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'เลือก...',
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
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2
            bg-white text-gray-900
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-gray-200 hover:border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-error' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
