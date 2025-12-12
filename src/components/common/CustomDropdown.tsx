// src/components/common/CustomDropdown.tsx

import React, { useState, useRef, useMemo } from 'react';
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';
import { useClickOutside } from '@utils/hooks/useClickOutside';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSearch?: boolean;
}

// ===================================================================
//                        CUSTOM DROPDOWN COMPONENT
// ===================================================================

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'เลือก...',
  disabled = false,
  showSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const selectedOption = useMemo(() => options.find(option => option.value === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchTerm) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, showSearch]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative font-body" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="form-input flex items-center justify-between text-left w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in max-h-60 overflow-hidden flex flex-col">
          {/* เพิ่มเงื่อนไขในการแสดงผลช่องค้นหา */}
          {showSearch && (
            <div className="p-2 border-b border-gray-100 relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition"
              />
              {searchTerm && (
                  <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                      <FaTimes />
                  </button>
              )}
            </div>
          )}
          <ul className="overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      value === option.value
                        ? 'bg-primary/10 text-primary-dark font-semibold'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 text-center">
                ไม่พบข้อมูล
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};