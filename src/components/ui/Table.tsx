// src/components/ui/Table.tsx

import React from 'react';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface TableColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  hoverable?: boolean;
  striped?: boolean;
  className?: string;
  onRowClick?: (record: T, index: number) => void;
}

// ===================================================================
//                        TABLE COMPONENT
// ===================================================================

function Table<T = any>({
  columns,
  data,
  loading = false,
  emptyText = 'ไม่มีข้อมูล',
  hoverable = true,
  striped = false,
  className = '',
  onRowClick,
}: TableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  alignClass[col.align || 'left']
                }`}
                style={{ width: col.width }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((record, index) => (
              <tr
                key={index}
                className={`
                  ${striped && index % 2 === 1 ? 'bg-gray-50/50' : ''}
                  ${hoverable ? 'hover:bg-primary/5 transition-colors duration-150' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 text-sm text-gray-900 ${alignClass[col.align || 'left']}`}
                  >
                    {col.render
                      ? col.render((record as any)[col.key], record, index)
                      : (record as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
