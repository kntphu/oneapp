// src/components/common/LoadingSpinner.tsx

import React, { memo } from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

// ===================================================================
//                        LOADING SPINNER COMPONENT
// ===================================================================

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
  message = 'กำลังโหลด...', 
  subMessage = 'โปรดรอสักครู่' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
        <p className="text-sm text-gray-600">{subMessage}</p>
      </div>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;