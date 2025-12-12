// src/components/ui/InputOTP.tsx

import React, { useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface InputOTPProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// ===================================================================
//                        INPUT OTP COMPONENT
// ===================================================================

const InputOTP: React.FC<InputOTPProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  className = '',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow numbers
    const sanitized = digit.replace(/[^0-9]/g, '');
    if (sanitized === '') {
      // Handle backspace
      const newValue = value.slice(0, index) + value.slice(index + 1);
      onChange(newValue);
      return;
    }

    const newValue = value.split('');
    newValue[index] = sanitized[0]; // Take only first digit
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Move to next input
    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        // Clear current digit
        handleChange(index, '');
      } else if (index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain');
    const sanitized = pastedData.replace(/[^0-9]/g, '').slice(0, length);
    onChange(sanitized);

    // Focus last filled input or last input
    const focusIndex = Math.min(sanitized.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleFocus = (index: number) => {
    // Select all text on focus for easier editing
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-bold
            rounded-lg border-2
            transition-all duration-200
            ${
              value[index]
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 bg-white'
            }
            ${
              !disabled
                ? 'hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none'
                : 'cursor-not-allowed opacity-50'
            }
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default InputOTP;
