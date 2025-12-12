// src/components/ui/Textarea.tsx

import React, { forwardRef } from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// ===================================================================
//                        TEXTAREA COMPONENT
// ===================================================================

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      className = '',
      ...props
    },
    ref
  ) => {
    const containerClass = fullWidth ? 'w-full' : '';
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <div className={`flex flex-col gap-1.5 ${containerClass}`}>
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2
            bg-white text-gray-900 placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-gray-200 hover:border-gray-300'}
            ${resizeClass}
            ${className}
          `}
          {...props}
        />
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-error' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
