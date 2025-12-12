// src/components/ui/Spinner.tsx

import React from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'accent' | 'white';
  fullScreen?: boolean;
  message?: string;
  subMessage?: string;
}

// ===================================================================
//                        SPINNER COMPONENT
// ===================================================================

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  message,
  subMessage,
}) => {
  const sizeStyles = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const colorStyles = {
    primary: 'border-gray-200 border-t-primary',
    accent: 'border-gray-200 border-t-accent',
    white: 'border-white/30 border-t-white',
  };

  const spinner = (
    <div className="relative">
      <div className={`${sizeStyles[size]} rounded-full ${colorStyles[color]} animate-spin`} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          {(message || subMessage) && (
            <div className="text-center">
              {message && <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>}
              {subMessage && <p className="text-sm text-gray-600">{subMessage}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return spinner;
};

export default Spinner;
