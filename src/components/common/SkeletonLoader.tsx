// src/components/common/SkeletonLoader.tsx

import React from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface SkeletonLoaderProps {
  type: 'table' | 'card' | 'list' | 'stat-card';
  count?: number;
  className?: string;
}

// ===================================================================
//                        SKELETON SUB-COMPONENTS
// ===================================================================

const TableRowSkeleton: React.FC = () => (
  <tr className="border-b animate-pulse">
    {Array.from({ length: 8 }).map((_, j) => (
      <td key={`skeleton-cell-${j}`} className="px-6 py-4">
        <div className="h-5 bg-gray-200 rounded-md"></div>
      </td>
    ))}
  </tr>
);

const CardSkeleton: React.FC = () => (
  <div className="p-4 border border-gray-200 rounded-lg bg-white animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
      <div className="space-y-1"><div className="h-3 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>
      <div className="space-y-1"><div className="h-3 bg-gray-200 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-3/4"></div></div>
    </div>
  </div>
);

const StatCardSkeleton: React.FC = () => (
  <div className="p-6 bg-white rounded-xl border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="space-y-2">
      <div className="h-7 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

const ListSkeleton: React.FC = () => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

// ===================================================================
//                        SKELETON LOADER COMPONENT
// ===================================================================

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 1,
  className = '',
}) => {
  const skeletons = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case 'table':
        return skeletons.map((_, i) => <TableRowSkeleton key={i} />);
      case 'card':
        return skeletons.map((_, i) => <CardSkeleton key={i} />);
      case 'stat-card':
        return skeletons.map((_, i) => <StatCardSkeleton key={i} />);
      case 'list':
        return skeletons.map((_, i) => <ListSkeleton key={i} />);
      default:
        return null;
    }
  };

  if (type === 'table') {
    return <>{renderSkeleton()}</>;
  }

  return <div className={className}>{renderSkeleton()}</div>;
};

export default SkeletonLoader;