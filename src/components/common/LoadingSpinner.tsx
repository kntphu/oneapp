// src/components/common/LoadingSpinner.tsx

import React, { memo } from 'react';
import { Spinner } from '@components/ui';

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

/**
 * Full-screen loading spinner component
 * Now using the new UI Spinner component for consistency
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  message = 'กำลังโหลด...',
  subMessage = 'โปรดรอสักครู่'
}) => (
  <Spinner
    fullScreen
    size="lg"
    message={message}
    subMessage={subMessage}
  />
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
