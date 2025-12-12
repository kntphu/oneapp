// src/pages/PlatesInfo.tsx

import React, { useState, useCallback, useMemo, memo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  FaCalculator, FaSearch, FaSpinner, FaLightbulb,
  FaHashtag, FaStar, FaTimes, FaGem, FaChartBar,
} from 'react-icons/fa';

import { calculatePlate } from '@api/ApiCollection';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showWarningToast } from '@utils/toastUtils';

// ===================================================================
//                        INTERFACES & TYPE DEFINITIONS
// ===================================================================

interface PlateDataItem {
  plate: string;
  sum: number;
  result: string;
}

interface GroupedPlateData {
  [key: number]: PlateDataItem[];
}

interface Significance {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

// ===================================================================
//                        MEMOIZED SUB-COMPONENTS
// ===================================================================

/**
 * Component ส่วนหัวของหน้า
 */
const PageHeader: React.FC = memo(() => (
  <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
        <FaCalculator className="h-6 w-6 text-primary-dark" />
      </div>
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-900">ศาสตร์แห่งตัวเลขทะเบียนรถ</h1>
        <p className="text-sm text-gray-600 mt-1">ค้นหาความหมายและพลังที่ซ่อนอยู่หลังป้ายทะเบียนของคุณ</p>
      </div>
    </div>
  </div>
));
PageHeader.displayName = 'PageHeader';

/**
 * Component ฟอร์มสำหรับกรอกป้ายทะเบียน
 */
const PlateInputForm: React.FC<{
  plateInput: string;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}> = memo(({ plateInput, onInputChange, onSubmit, isLoading }) => (
  <form onSubmit={onSubmit} className="relative">
    <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={plateInput}
      onChange={onInputChange}
      placeholder="กรอกป้ายทะเบียน หรือ หมวดอักษร หรือ ผลรวมที่ต้องการ..."
      className="form-input pl-12 pr-32 w-full"
      disabled={isLoading}
      autoComplete="off"
    />
    <button
      type="submit"
      disabled={isLoading || !plateInput.trim()}
      className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
      <span>ค้นหา</span>
    </button>
  </form>
));
PlateInputForm.displayName = 'PlateInputForm';

/**
 * Component การ์ดแสดงป้ายทะเบียนแต่ละอัน
 */
const PlateCard: React.FC<{ item: PlateDataItem }> = memo(({ item }) => (
  <div className="bg-white/70 border border-gray-200 rounded-lg p-3 text-center transition-all duration-300 hover:shadow-md hover:border-primary/50 transform hover:-translate-y-1">
    <p className="font-sans font-semibold text-lg text-gray-800 tracking-wider">{item.plate}</p>
    <p className="text-xs text-gray-500">กรุงเทพมหานคร</p>
  </div>
));
PlateCard.displayName = 'PlateCard';

/**
 * Component แสดงกลุ่มของผลลัพธ์ (ทั้งแบบมีและไม่มีตารางทะเบียน)
 */
const ResultGroup: React.FC<{ sum: string; items: PlateDataItem[]; significance: Significance; showPlateGrid: boolean }> = memo(({ sum, items, significance, showPlateGrid }) => (
  <div className={`rounded-xl border ${significance.borderColor} ${significance.bgColor} p-6`}>
    <div className="flex items-center gap-3 mb-2">
      <significance.icon className={`w-6 h-6 ${significance.textColor}`} />
      <h2 className={`text-2xl font-bold font-sans ${significance.textColor}`}>
        ผลรวม {sum} ({significance.label})
      </h2>
    </div>
    <p className={`font-semibold ${significance.textColor} mb-4`}>{significance.description}</p>
    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{items[0].result}</p>
    {showPlateGrid && (
      <div className="mt-6 pt-4 border-t border-gray-300/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map(item => <PlateCard key={item.plate} item={item} />)}
        </div>
      </div>
    )}
  </div>
));
ResultGroup.displayName = 'ResultGroup';


/**
 * Component จัดการการแสดงผลทั้งหมด
 */
const ResultsDisplay: React.FC<{
  isLoading: boolean;
  plateData: PlateDataItem[] | null;
  getSumSignificance: (sum: number) => Significance;
}> = memo(({ isLoading, plateData, getSumSignificance }) => {
  const groupedResults = useMemo(() => {
    if (!plateData) return null;
    return plateData.reduce((acc: GroupedPlateData, item: PlateDataItem) => {
      (acc[item.sum] = acc[item.sum] || []).push(item);
      return acc;
    }, {});
  }, [plateData]);

  if (isLoading) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center gap-4 text-gray-600">
        <FaSpinner className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg">กำลังคำนวณผลลัพธ์...</p>
      </div>
    );
  }

  if (!plateData) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FaLightbulb className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">เริ่มต้นค้นหาความหมาย</h3>
        <p className="mt-2">เพียงกรอกหมายเลขทะเบียนเพื่อวิเคราะห์ผลรวม</p>
      </div>
    );
  }

  if (groupedResults && Object.keys(groupedResults).length > 0) {
    const numberOfGroups = Object.keys(groupedResults).length;
    return (
      <div className="space-y-6 animate-fade-in">
        {Object.entries(groupedResults)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([sum, items]) => (
            <ResultGroup 
              key={sum} 
              sum={sum} 
              items={items} 
              significance={getSumSignificance(parseInt(sum))}
              showPlateGrid={numberOfGroups > 1} // แสดงตารางเมื่อมีผลลัพธ์มากกว่า 1 กลุ่ม
            />
          ))}
      </div>
    );
  }

  return (
    <div className="text-center py-16 text-gray-500">
      <FaSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800">ไม่พบผลลัพธ์</h3>
      <p className="mt-2">ไม่พบข้อมูลสำหรับป้ายทะเบียนที่คุณค้นหา</p>
    </div>
  );
});
ResultsDisplay.displayName = 'ResultsDisplay';


// ===================================================================
//                        MAIN PAGE COMPONENT
// ===================================================================

const PlatesInfo: React.FC = () => {
  const [plateInput, setPlateInput] = useState('');
  const [plateData, setPlateData] = useState<PlateDataItem[] | null>(null);

  const calculateMutation = useApiMutation<PlateDataItem[], string>({
    mutationFn: calculatePlate,
    queryKeyToInvalidate: ['plates'],
    successMessage: 'คำนวณข้อมูลสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการคำนวณ',
    onSuccessCallback: (data) => {
      setPlateData(data);
    }
  });

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = plateInput.trim();
    if (!trimmedInput) {
      showWarningToast('กรุณากรอกป้ายทะเบียน');
      return;
    }
    calculateMutation.mutate(trimmedInput);
  }, [plateInput, calculateMutation]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPlateInput(e.target.value);
  }, []);

  const getSumSignificance = useCallback((sum: number): Significance => {
    const veryGood = [5, 6, 9, 14, 15, 19, 23, 24, 36, 40, 41, 42, 44, 45, 46, 50, 51];
    if (veryGood.includes(sum)) return { label: 'ดีมาก', icon: FaStar, textColor: 'text-green-700', borderColor: 'border-green-200', bgColor: 'bg-green-50', description: 'ผลรวมยอดเยี่ยม เสริมด้านโชคลาภ การเงิน และความสำเร็จ' };
    const good = [1, 3, 22, 25, 29, 32, 34, 38, 39, 43, 53, 54, 55, 56, 59, 63, 64, 65];
    if (good.includes(sum)) return { label: 'ดี', icon: FaGem, textColor: 'text-blue-700', borderColor: 'border-blue-200', bgColor: 'bg-blue-50', description: 'ผลรวมดี เสริมดวงชะตาให้ราบรื่น' };
    const bad = [4, 7, 8, 13, 22, 30, 31, 37, 48, 49];
    if (bad.includes(sum)) return { label: 'ไม่ดี', icon: FaTimes, textColor: 'text-red-700', borderColor: 'border-red-200', bgColor: 'bg-red-50', description: 'ผลรวมไม่ดี ควรหลีกเลี่ยง' };
    return { label: 'พอใช้', icon: FaChartBar, textColor: 'text-yellow-700', borderColor: 'border-yellow-200', bgColor: 'bg-yellow-50', description: 'ผลรวมทั่วไป ไม่ดีไม่ร้าย ควรระมัดระวัง' };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader />
      <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100 space-y-6">
        <PlateInputForm
          plateInput={plateInput}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={calculateMutation.isPending}
        />
        <div className="border-t border-gray-200 -mx-6" />
        <ResultsDisplay
          isLoading={calculateMutation.isPending}
          plateData={plateData}
          getSumSignificance={getSumSignificance}
        />
      </div>
    </div>
  );
};

export default PlatesInfo;