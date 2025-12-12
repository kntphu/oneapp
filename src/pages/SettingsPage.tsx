// src/pages/SettingsPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FaCogs, FaEdit, FaTrash, FaPlus, FaCar, FaUser,
  FaIdCard, FaTags, FaSave, FaTimes, FaWrench, FaMotorcycle, FaSpinner
} from 'react-icons/fa';

import CarTypeIcon from '@components/common/CarTypeIcon';
import {
  fetchVehicleBrands, addVehicleBrand, updateVehicleBrand, deleteVehicleBrand,
  fetchTitles, addTitle, updateTitle, deleteTitle,
  fetchPersTypes, addPersType, updatePersType, deletePersType,
  fetchCarTypes, addCarType, updateCarType, deleteCarType,
  fetchVehicleBasicSettings, updateVehicleBasicSettings,
} from '../api/ApiCollection';
import { CACHE_CONFIG } from '../config';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { showErrorToast } from '@utils/toastUtils';
import { useConfirmationToast } from '@utils/hooks/useConfirmationToast';
import Pagination from '@components/common/Pagination';
import SkeletonLoader from '@components/common/SkeletonLoader';
import { useResponsive } from '@utils/hooks/useResponsive';
import { CustomDropdown } from '@components/common/CustomDropdown';

// ===================================================================
//                        INTERFACES & TYPE DEFINITIONS
// ===================================================================

/**
 * Interface สำหรับข้อมูลการตั้งค่าแต่ละรายการ
 */
interface SettingsItem {
  id: number;
  name: string;
}

/**
 * Interface สำหรับโครงสร้างของแต่ละ Section ในหน้าตั้งค่า
 */
interface SettingsSectionInfo {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<any>;
}

/**
 * Interface สำหรับข้อมูลที่ได้จาก API ที่มี key เป็น dynamic
 */
interface ApiDataResponse {
  [key: string]: any;
  data?: any;
}


// ===================================================================
//                        CHILD COMPONENTS - UI SECTIONS
// ===================================================================

/**
 * Component ส่วนหัวของหน้าตั้งค่า
 */
const SettingsHeader: React.FC = React.memo(() => (
  <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
        <FaCogs className="h-6 w-6 text-primary-dark" />
      </div>
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-900">การตั้งค่าระบบ</h1>
        <p className="text-sm text-gray-600 mt-1">จัดการข้อมูลพื้นฐานและพารามิเตอร์ต่างๆ ของระบบ</p>
      </div>
    </div>
  </div>
));
SettingsHeader.displayName = 'SettingsHeader';

/**
 * Component สำหรับการนำทาง (Navigation) ระหว่างส่วนต่างๆ ของหน้าตั้งค่า
 */
const SettingsNav: React.FC<{
  sections: SettingsSectionInfo[];
  activeTab: string;
  onTabChange: (id: string) => void;
}> = React.memo(({ sections, activeTab, onTabChange }) => {
  const { isMobile } = useResponsive();

  const dropdownOptions = useMemo(() =>
    sections.map(section => ({
      value: section.id,
      label: section.title,
    })), [sections]);

  if (isMobile) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4">
        <CustomDropdown
          value={activeTab}
          onChange={onTabChange}
          options={dropdownOptions}
          showSearch={false}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-4 space-y-2">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => onTabChange(section.id)}
          className={`w-full flex items-center gap-3 text-left p-3 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === section.id
              ? 'bg-primary/10 text-primary-dark'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          aria-current={activeTab === section.id ? 'page' : undefined}
        >
          <section.icon className={`w-5 h-5 ${activeTab === section.id ? 'text-primary-dark' : 'text-gray-400'}`} />
          {section.title}
        </button>
      ))}
    </div>
  );
});
SettingsNav.displayName = 'SettingsNav';

/**
 * Component สำหรับแสดงผลและจัดการการตั้งค่าพื้นฐาน
 */
const BasicSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, isSuccess, error } = useQuery<ApiDataResponse>({
    queryKey: ['settings', 'basic-settings'],
    queryFn: fetchVehicleBasicSettings,
    staleTime: CACHE_CONFIG.staleTime.medium,
  });

  useEffect(() => {
    if (isSuccess && data) {
      const settingsData = data.settings || data.data || data;
      if (settingsData && typeof settingsData === 'object' && !Array.isArray(settingsData)) {
        setSettings(settingsData);
      }
    }
  }, [data, isSuccess]);

  const updateMutation = useApiMutation({
    mutationFn: (settingsData: any) => updateVehicleBasicSettings(settingsData),
    queryKeyToInvalidate: ['settings', 'basic-settings'],
    successMessage: 'อัปเดตการตั้งค่าสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการอัปเดต',
    onSuccessCallback: () => setIsEditing(false),
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (data) setSettings(data.settings || data.data || data);
  };
  const handleSave = () => updateMutation.mutate(settings);
  const handleChange = (field: string, value: any) => setSettings(prev => ({ ...prev, [field]: value }));

  const motorcycleSettings = Object.fromEntries(Object.entries(settings).filter(([k]) => k.toLowerCase().includes('mc') || k.toLowerCase().includes('motorcycle')));
  const carSettings = Object.fromEntries(Object.entries(settings).filter(([k]) => !k.toLowerCase().includes('mc') && !k.toLowerCase().includes('motorcycle')));

  const renderGroup = (title: string, icon: React.ElementType, groupSettings: Record<string, any>, color: 'purple' | 'blue') => {
    const IconComponent = icon;
    return (
      <div className={`bg-white rounded-xl p-6 border shadow-sm space-y-4`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <IconComponent className={`h-5 w-5 text-${color}-600`} />
          </div>
          <h4 className={`text-lg font-semibold text-gray-800`}>{title}</h4>
        </div>
        {Object.entries(groupSettings).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key} className="form-label capitalize">{key.replace(/_/g, ' ')}</label>
            <input
              id={key}
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="form-input"
              disabled={!isEditing}
            />
          </div>
        ))}
      </div>
    );
  };

  if (error) return <p className="text-error text-center">ไม่สามารถโหลดข้อมูลได้</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3"><FaWrench className="w-5 h-5 text-primary" />การตั้งค่าพื้นฐาน</h3>
          <p className="text-sm text-gray-600 mt-1">จัดการการตั้งค่าพื้นฐานของระบบ</p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button onClick={handleCancel} className="btn-secondary text-sm">ยกเลิก</button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-success flex items-center gap-2 text-sm">
              {updateMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />} บันทึก
            </button>
          </div>
        ) : (
          <button onClick={handleEdit} className="btn-primary flex items-center gap-2 text-sm self-end sm:self-center"><FaEdit /> แก้ไข</button>
        )}
      </div>

      {isLoading ? (
        <SkeletonLoader type="stat-card" count={2} className="grid grid-cols-1 gap-6" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.keys(motorcycleSettings).length > 0 && renderGroup("ตั้งค่าระบบมอเตอร์ไซค์", FaMotorcycle, motorcycleSettings, 'purple')}
          {Object.keys(carSettings).length > 0 && renderGroup("ตั้งค่าระบบรถยนต์", FaCar, carSettings, 'blue')}
        </div>
      )}
    </div>
  );
};

/**
 * Component Generic สำหรับแสดงผลและจัดการข้อมูลการตั้งค่าแบบรายการ
 */
const ListItemSettingsView: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fetchFunction: () => Promise<any>;
  addFunction: (name: string) => Promise<any>;
  updateFunction: (id: number, name: string) => Promise<any>;
  deleteFunction: (id: number) => Promise<any>;
  dataKey: string;
}> = ({ title, icon: Icon, description, fetchFunction, addFunction, updateFunction, deleteFunction, dataKey }) => {
  const [editingItem, setEditingItem] = useState<SettingsItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { showConfirmationToast } = useConfirmationToast();

  const { data, isLoading, error } = useQuery<ApiDataResponse>({
    queryKey: ['settings', dataKey],
    queryFn: fetchFunction,
    staleTime: CACHE_CONFIG.staleTime.medium,
  });

  const allItems: SettingsItem[] = useMemo(() => {
    if (!data) return [];
    let rawItems = data[dataKey] || data.data || [];
    if (!Array.isArray(rawItems)) rawItems = [];
    return rawItems.map((item: any) => ({
      id: item.id,
      name: item.brand_name || item.title_name || item.pers_type_name || item.car_type_name || item.name || ''
    }));
  }, [data, dataKey]);

  const { paginatedItems, totalPages } = useMemo(() => ({
    paginatedItems: allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    totalPages: Math.ceil(allItems.length / itemsPerPage) || 1,
  }), [allItems, currentPage, itemsPerPage]);

  const addMutation = useApiMutation({ mutationFn: addFunction, queryKeyToInvalidate: ['settings', dataKey], successMessage: 'เพิ่มข้อมูลสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด', onSuccessCallback: () => { setIsAdding(false); setNewItemName(''); } });
  const updateMutation = useApiMutation({ mutationFn: ({ id, name }: SettingsItem) => updateFunction(id, name), queryKeyToInvalidate: ['settings', dataKey], successMessage: 'แก้ไขข้อมูลสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด', onSuccessCallback: () => setEditingItem(null) });
  const deleteMutation = useApiMutation<any, number>({ mutationFn: deleteFunction, queryKeyToInvalidate: ['settings', dataKey], successMessage: 'ลบข้อมูลสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด' });

  const handleSaveNew = () => { if (newItemName.trim()) addMutation.mutate(newItemName.trim()); };
  const handleSaveEdit = () => { if (editingItem?.name.trim()) updateMutation.mutate(editingItem); };
  const handleDelete = (item: SettingsItem) => showConfirmationToast({ title: 'ยืนยันการลบ', message: `คุณต้องการลบ "${item.name}" ใช่หรือไม่?`, onConfirm: () => deleteMutation.mutate(item.id) });
  const handleCancel = () => { setEditingItem(null); setIsAdding(false); setNewItemName(''); };

  if (error) showErrorToast(`ไม่สามารถโหลดข้อมูลได้: ${(error as Error)?.message}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3"><Icon className="w-5 h-5 text-primary" />{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <button onClick={() => setIsAdding(true)} disabled={isAdding} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 self-end sm:self-center"><FaPlus />เพิ่มใหม่</button>
      </div>

      <div className="space-y-3">
        {isLoading ? <SkeletonLoader type="list" count={itemsPerPage} className="space-y-3" /> : (
          <>
            {isAdding && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveNew()} placeholder={`ใส่ชื่อ${title}ใหม่`} className="form-input py-2 flex-grow" autoFocus />
                <button onClick={handleSaveNew} disabled={!newItemName.trim() || addMutation.isPending} className="btn-success p-2"><FaSave /></button>
                <button onClick={handleCancel} className="btn-secondary p-2"><FaTimes /></button>
              </div>
            )}
            {paginatedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-sm transition-all group">
                {editingItem?.id === item.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} className="form-input py-2 flex-grow" autoFocus />
                    <button onClick={handleSaveEdit} disabled={!editingItem.name.trim() || updateMutation.isPending} className="btn-success p-2"><FaSave /></button>
                    <button onClick={handleCancel} className="btn-secondary p-2"><FaTimes /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      {dataKey === 'carTypes' ? <CarTypeIcon type={item.name} /> : <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-info rounded-full hover:bg-info/10"><FaEdit /></button>
                      <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-error rounded-full hover:bg-error/10"><FaTrash /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {!paginatedItems.length && !isAdding && <p className="text-center text-gray-500 py-8">ไม่มีข้อมูล</p>}
          </>
        )}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={() => setCurrentPage(p => p + 1)} onPrevPage={() => setCurrentPage(p => p - 1)} itemsCount={paginatedItems.length} totalItems={allItems.length} itemName={title} />}
    </div>
  );
};

// ===================================================================
//                        MAIN PAGE COMPONENT
// ===================================================================

/**
 * Component หน้าหลักสำหรับการตั้งค่าระบบ
 */
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic-settings');
  const { isMobile } = useResponsive();

  const settingsSections: SettingsSectionInfo[] = useMemo(() => [
    { id: 'basic-settings', title: 'การตั้งค่าพื้นฐาน', icon: FaWrench, description: 'จัดการการตั้งค่าพื้นฐานของระบบ', component: BasicSettingsView },
    { id: 'titles', title: 'คำนำหน้า', icon: FaUser, description: 'จัดการคำนำหน้าชื่อ', component: () => <ListItemSettingsView title="คำนำหน้า" icon={FaUser} description="จัดการคำนำหน้าชื่อ" fetchFunction={fetchTitles} addFunction={addTitle} updateFunction={updateTitle} deleteFunction={deleteTitle} dataKey="titles" /> },
    { id: 'pers-types', title: 'ประเภทการจอง', icon: FaIdCard, description: 'จัดการประเภทการจองรถ', component: () => <ListItemSettingsView title="ประเภทการจอง" icon={FaIdCard} description="จัดการประเภทการจองรถ" fetchFunction={fetchPersTypes} addFunction={addPersType} updateFunction={updatePersType} deleteFunction={deletePersType} dataKey="persTypes" /> },
    { id: 'car-types', title: 'ประเภทรถ', icon: FaTags, description: 'จัดการประเภทรถ', component: () => <ListItemSettingsView title="ประเภทรถ" icon={FaTags} description="จัดการประเภทรถ" fetchFunction={fetchCarTypes} addFunction={addCarType} updateFunction={updateCarType} deleteFunction={deleteCarType} dataKey="carTypes" /> },
    { id: 'vehicle-brands', title: 'ยี่ห้อรถ', icon: FaCar, description: 'จัดการยี่ห้อรถยนต์', component: () => <ListItemSettingsView title="ยี่ห้อรถ" icon={FaCar} description="จัดการยี่ห้อรถยนต์" fetchFunction={fetchVehicleBrands} addFunction={addVehicleBrand} updateFunction={updateVehicleBrand} deleteFunction={deleteVehicleBrand} dataKey="brands" /> }
  ], []);

  const ActiveComponent = useMemo(() => {
    return settingsSections.find(s => s.id === activeTab)?.component || BasicSettingsView;
  }, [activeTab, settingsSections]);

  return (
    <div className="space-y-6">
      <SettingsHeader />
      
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        <div className={isMobile ? 'col-span-1' : 'col-span-3'}>
          <SettingsNav sections={settingsSections} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <div className={isMobile ? 'col-span-1' : 'col-span-9'}>
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 min-h-[500px]">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;