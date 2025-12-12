// src/pages/LineOAPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FaLine, FaUsers, FaKey, FaPlus, FaEdit, FaTrash,
  FaToggleOn, FaToggleOff, FaSave, FaSpinner,
  FaLink, FaUnlink, FaUserCheck, FaSearch, FaTimes,
  FaClock, FaPaperPlane
} from 'react-icons/fa';

import {
  fetchLineUsers, fetchLineKeywords, addLineKeyword,
  updateLineKeyword, deleteLineKeyword,
  linkCustomerToLineUser, unlinkCustomerFromLineUser,
  updateLineUser,
  fetchScheduledMessages,
  deleteScheduledMessage,
  type LineUser, type LineKeyword
} from '@api/ApiLineOA';
import { fetchCustomer } from '@api/ApiCollection';
import type { FormattedCustomer, ScheduledMessage } from '@api/types';
import { useApiMutation } from '@utils/hooks/useApiMutation';
import { useConfirmationToast } from '@utils/hooks/useConfirmationToast';
import { showErrorToast, showWarningToast } from '@utils/toastUtils';
import Pagination from '@components/common/Pagination';
import SkeletonLoader from '@components/common/SkeletonLoader';
import { useResponsive } from '@utils/hooks/useResponsive';
import ScheduledMessageModal from '@components/ScheduledMessageModal';
import { CustomDropdown } from '@components/common/CustomDropdown';

// ===================================================================
//                        MODAL COMPONENTS
// ===================================================================

interface LinkCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (customerId: number) => void;
  lineUser: LineUser | null;
}

/**
 * Component Modal สำหรับเชื่อมโยง Line User กับข้อมูลลูกค้า
 */
const LinkCustomerModal: React.FC<LinkCustomerModalProps> = ({ isOpen, onClose, onLink, lineUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading } = useQuery<FormattedCustomer[]>({
    queryKey: ['customersForLinking'],
    queryFn: fetchCustomer,
    enabled: isOpen,
  });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(lowercasedTerm) ||
      c.lastName.toLowerCase().includes(lowercasedTerm) ||
      c.phone.includes(lowercasedTerm) ||
      c.idCard.includes(lowercasedTerm)
    );
  }, [customers, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800">เชื่อมโยงลูกค้ากับ Line User</h3>
            <p className="text-sm text-gray-500">สำหรับ: {lineUser?.displayName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FaTimes /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, นามสกุล, เบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full pl-10"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center flex items-center justify-center gap-2 text-gray-600">
              <FaSpinner className="animate-spin" />
              <span>กำลังโหลดข้อมูลลูกค้า...</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredCustomers.map(customer => (
                <li key={customer.id} className="p-3 border rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{customer.name} {customer.lastName}</p>
                      <p className="text-sm text-gray-600">เบอร์โทร: {customer.phone}</p>
                    </div>
                    <button onClick={() => onLink(customer.id)} className="btn-primary text-sm flex items-center gap-2">
                      <FaLink />เชื่อมโยง
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ===================================================================
//                        TAB COMPONENTS
// ===================================================================

/**
 * Component Tab สำหรับจัดการผู้ใช้งาน Line
 */
const LineUsersTab: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingUser, setLinkingUser] = useState<LineUser | null>(null);
  const [editingUser, setEditingUser] = useState<LineUser | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');

  const itemsPerPage = 10;
  const { isMobile } = useResponsive();
  const { showConfirmationToast } = useConfirmationToast();

  const { data: lineUsers, isLoading: isLoadingUsers, isError: isUsersError, error: usersError } = useQuery<LineUser[]>({
    queryKey: ['lineUsers'],
    queryFn: fetchLineUsers,
  });

  const { data: customers, isLoading: isLoadingCustomers, isError: isCustomersError, error: customersError } = useQuery<FormattedCustomer[]>({
    queryKey: ['customers'],
    queryFn: fetchCustomer,
  });

  const getStageChip = useCallback((stage: string) => {
    let styles = 'bg-gray-100 text-gray-800';
    if (stage.toLowerCase() === 'live_chat') {
      styles = 'bg-blue-100 text-blue-800 animate-pulse';
    } else if (stage.toLowerCase() !== 'none' && stage.toLowerCase() !== 'completed' && stage.toLowerCase() !== 'finalized') {
      styles = 'bg-yellow-100 text-yellow-800';
    }
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles}`}>{stage}</span>;
  }, []);

  const mergedUsers = useMemo(() => {
    if (!lineUsers || !customers) return [];
    const customerMap = new Map(customers.map(c => [c.id, c]));
    return lineUsers.map(user => ({
      ...user,
      customer: user.customerId ? customerMap.get(user.customerId) : null,
    }));
  }, [lineUsers, customers]);

  const { paginatedItems, totalPages } = useMemo(() => {
    if (!mergedUsers) return { paginatedItems: [], totalPages: 1 };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = mergedUsers.slice(startIndex, startIndex + itemsPerPage);
    const pages = Math.ceil(mergedUsers.length / itemsPerPage);
    return { paginatedItems: paginated, totalPages: pages > 0 ? pages : 1 };
  }, [mergedUsers, currentPage, itemsPerPage]);

  const linkMutation = useApiMutation({
    mutationFn: ({ customerId }: { customerId: number }) => {
      if (!linkingUser) throw new Error("No user selected for linking");
      return linkCustomerToLineUser(linkingUser.lineUserId, customerId);
    },
    queryKeyToInvalidate: ['lineUsers'],
    successMessage: 'เชื่อมโยงลูกค้าสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการเชื่อมโยง',
    onSuccessCallback: () => setIsLinkModalOpen(false),
  });

  const unlinkMutation = useApiMutation({
    mutationFn: (lineUserId: string) => unlinkCustomerFromLineUser(lineUserId),
    queryKeyToInvalidate: ['lineUsers'],
    successMessage: 'ยกเลิกการเชื่อมโยงสำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการยกเลิก',
  });

  const updateUserMutation = useApiMutation({
    mutationFn: ({ id, displayName }: { id: string, displayName: string }) =>
      updateLineUser(id, { displayName }),
    queryKeyToInvalidate: ['lineUsers'],
    successMessage: 'อัปเดตชื่อผู้ใช้สำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการอัปเดตชื่อ',
    onSuccessCallback: () => setEditingUser(null),
  });

  const handleOpenLinkModal = useCallback((user: LineUser) => { setLinkingUser(user); setIsLinkModalOpen(true); }, []);
  const handleCloseLinkModal = useCallback(() => { setLinkingUser(null); setIsLinkModalOpen(false); }, []);
  const handleLinkCustomer = useCallback((customerId: number) => { linkMutation.mutate({ customerId }); }, [linkMutation]);
  const handleUnlinkCustomer = useCallback((user: LineUser) => {
    showConfirmationToast({
      title: 'ยืนยันการยกเลิก',
      message: `คุณต้องการยกเลิกการเชื่อมโยง "${user.displayName}" ออกจาก "${user.customer?.name} ${user.customer?.lastName}" ใช่หรือไม่?`,
      onConfirm: () => unlinkMutation.mutate(user.lineUserId),
    });
  }, [unlinkMutation, showConfirmationToast]);
  const handleEditClick = useCallback((user: LineUser) => { setEditingUser(user); setNewDisplayName(user.displayName); }, []);
  const handleCancelEdit = useCallback(() => { setEditingUser(null); setNewDisplayName(''); }, []);
  const handleSaveEdit = useCallback(() => {
    if (editingUser && newDisplayName.trim()) {
      updateUserMutation.mutate({ id: editingUser.id, displayName: newDisplayName.trim() });
    } else {
      showWarningToast('ชื่อต้องไม่เป็นค่าว่าง');
    }
  }, [editingUser, newDisplayName, updateUserMutation]);
  const handleNextPage = useCallback(() => setCurrentPage(prev => Math.min(prev + 1, totalPages)), [totalPages]);
  const handlePrevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  const isLoading = isLoadingUsers || isLoadingCustomers;
  if (isUsersError) showErrorToast(`ไม่สามารถโหลดข้อมูลผู้ใช้ได้: ${(usersError as Error)?.message}`);
  if (isCustomersError) showErrorToast(`ไม่สามารถโหลดข้อมูลลูกค้าได้: ${(customersError as Error)?.message}`);

  return (
    <>
      <LinkCustomerModal isOpen={isLinkModalOpen} onClose={handleCloseLinkModal} onLink={handleLinkCustomer} lineUser={linkingUser} />
      <div className="p-4 md:p-6">
        {isLoading ? (
          isMobile ? <SkeletonLoader type="card" count={5} /> : (
            <div className="overflow-x-auto rounded-lg border"><table className="w-full"><thead><tr><th className="px-6 py-3">Profile</th><th className="px-6 py-3">Display Name</th><th className="px-6 py-3">ลูกค้าที่เชื่อมโยง</th><th className="px-6 py-3">ดำเนินการ</th></tr></thead><tbody><SkeletonLoader type="table" count={itemsPerPage} /></tbody></table></div>
          )
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Img Line</th>
                    <th className="px-6 py-3">ชื่อแสดงใน Line</th>
                    <th className="px-6 py-3">ลูกค้าที่เชื่อมโยง</th>
                    <th className="px-6 py-3">สถานะปัจจุบัน</th>
                    <th className="px-6 py-3 text-center">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(user => (
                    <tr key={user.lineUserId} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4"><img src={user.pictureUrl} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" /></td>
                      <td className="px-6 py-4">
                        {editingUser?.lineUserId === user.lineUserId ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} className="form-input text-sm py-1" autoFocus />
                            <button onClick={handleSaveEdit} disabled={updateUserMutation.isPending} className="p-2 text-success hover:bg-success/10 rounded-lg"><FaSave /></button>
                            <button onClick={handleCancelEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
                          </div>
                        ) : (
                          <div className="group flex items-center gap-2">
                            <div className="font-medium text-gray-900">{user.displayName}</div>
                            <button onClick={() => handleEditClick(user)} className="p-1 text-gray-400 hover:text-info rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Edit ${user.displayName}`}><FaEdit /></button>
                          </div>
                        )}
                        <div className="font-mono text-xs text-gray-500">{user.lineUserId}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.customer ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <FaUserCheck />
                            <div>
                              <p className="font-semibold">{user.customer.name} {user.customer.lastName}</p>
                              <p className="text-xs">ID: {user.customer.id}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">ยังไม่ได้เชื่อมโยง</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStageChip(user.conversationStage)}</td>
                      <td className="px-6 py-4 text-center">
                        {user.customer ? (
                          <button onClick={() => handleUnlinkCustomer(user)} className="btn-secondary-outline text-error border-error hover:bg-error/10 text-xs flex items-center gap-2 mx-auto"><FaUnlink />ยกเลิก</button>
                        ) : (
                          <button onClick={() => handleOpenLinkModal(user)} className="btn-secondary-outline text-xs flex items-center gap-2 mx-auto"><FaLink />เชื่อมโยง</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-4">
              {paginatedItems.map(user => (
                <div key={user.lineUserId} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={user.pictureUrl} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{user.lineUserId}</p>
                      </div>
                    </div>
                    {getStageChip(user.conversationStage)}
                  </div>
                  <div className="border-t pt-3">
                    {user.customer ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">ลูกค้าที่เชื่อมโยง:</p>
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-md">
                          <FaUserCheck />
                          <div>
                            <p className="font-semibold">{user.customer.name} {user.customer.lastName}</p>
                            <p className="text-xs">ID: {user.customer.id}</p>
                          </div>
                        </div>
                        <button onClick={() => handleUnlinkCustomer(user)} className="btn-secondary-outline text-error border-error hover:bg-error/10 text-xs w-full flex items-center justify-center gap-2 mt-2"><FaUnlink />ยกเลิกการเชื่อมโยง</button>
                      </div>
                    ) : (
                      <button onClick={() => handleOpenLinkModal(user)} className="btn-secondary-outline text-xs w-full flex items-center justify-center gap-2"><FaLink />เชื่อมโยงกับลูกค้า</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onNextPage={handleNextPage} onPrevPage={handlePrevPage} itemsCount={paginatedItems.length} totalItems={mergedUsers?.length || 0} itemName="ผู้ใช้" />}
          </>
        )}
      </div>
    </>
  );
};

/**
 * Component Tab สำหรับจัดการคีย์เวิร์ด
 */
const LineKeywordsTab: React.FC = () => {
  const [editingItem, setEditingItem] = useState<LineKeyword | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState({ keyword: '', reply: '' });

  const { data: keywords, isLoading, isError, error } = useQuery<LineKeyword[]>({
    queryKey: ['lineKeywords'],
    queryFn: fetchLineKeywords,
  });

  const { showConfirmationToast } = useConfirmationToast();

  const addMutation = useApiMutation({ mutationFn: addLineKeyword, queryKeyToInvalidate: ['lineKeywords'], successMessage: 'เพิ่มคีย์เวิร์ดสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด', onSuccessCallback: () => { setIsAddingNew(false); setNewItem({ keyword: '', reply: '' }); } });
  const updateMutation = useApiMutation({ mutationFn: (data: LineKeyword) => updateLineKeyword(data.id, data), queryKeyToInvalidate: ['lineKeywords'], successMessage: 'แก้ไขคีย์เวิร์ดสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด', onSuccessCallback: () => setEditingItem(null) });
  const deleteMutation = useApiMutation({ mutationFn: (id: number) => deleteLineKeyword(id), queryKeyToInvalidate: ['lineKeywords'], successMessage: 'ลบคีย์เวิร์ดสำเร็จ', errorMessage: 'เกิดข้อผิดพลาด' });

  const handleSaveNew = () => {
    if (!newItem.keyword.trim() || !newItem.reply.trim()) {
      showWarningToast('กรุณากรอกทั้ง Keyword และข้อความตอบกลับ');
      return;
    }
    addMutation.mutate({ ...newItem, enabled: true });
  };

  const handleSaveEdit = () => {
    if (editingItem && editingItem.keyword.trim() && editingItem.reply.trim()) {
      updateMutation.mutate(editingItem);
    }
  };

  const handleDelete = (item: LineKeyword) => {
    showConfirmationToast({ title: 'ยืนยันการลบ', message: `คุณต้องการลบ Keyword "${item.keyword}" ใช่หรือไม่?`, onConfirm: () => deleteMutation.mutate(item.id) });
  };

  if (isError) showErrorToast(`ไม่สามารถโหลดข้อมูลคีย์เวิร์ดได้: ${(error as Error)?.message}`);

  const inputClass = "form-input";
  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setIsAddingNew(true); setEditingItem(null); }} className="btn-primary flex items-center gap-2 text-sm"><FaPlus />เพิ่มคีย์เวิร์ดใหม่</button>
      </div>

      {isLoading ? <SkeletonLoader type="list" count={5} className="space-y-3" /> : (
        <div className="space-y-3">
          {isAddingNew && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
              <input type="text" placeholder="พิมพ์ Keyword ที่นี่ (เช่น สอบถามครับ)" value={newItem.keyword} onChange={e => setNewItem({ ...newItem, keyword: e.target.value })} className={inputClass} />
              <textarea placeholder="พิมพ์ข้อความตอบกลับที่นี่" value={newItem.reply} onChange={e => setNewItem({ ...newItem, reply: e.target.value })} className={`${inputClass} min-h-[80px]`} />
              <div className="flex gap-2">
                <button onClick={handleSaveNew} disabled={isMutating} className="btn-success flex items-center gap-2 text-sm">{isMutating ? <FaSpinner className="animate-spin" /> : <FaSave />} บันทึก</button>
                <button onClick={() => setIsAddingNew(false)} className="btn-secondary text-sm">ยกเลิก</button>
              </div>
            </div>
          )}
          {keywords?.map(item => (
            editingItem?.id === item.id ? (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg border space-y-3">
                <input type="text" value={editingItem.keyword} onChange={e => setEditingItem({ ...editingItem, keyword: e.target.value })} className={inputClass} />
                <textarea value={editingItem.reply} onChange={e => setEditingItem({ ...editingItem, reply: e.target.value })} className={`${inputClass} min-h-[80px]`} />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} disabled={isMutating} className="btn-success flex items-center gap-2 text-sm">{isMutating ? <FaSpinner className="animate-spin" /> : <FaSave />} บันทึก</button>
                    <button onClick={() => setEditingItem(null)} className="btn-secondary text-sm">ยกเลิก</button>
                  </div>
                  <button onClick={() => setEditingItem({ ...editingItem, enabled: !editingItem.enabled })} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${editingItem.enabled ? 'text-success' : 'text-gray-500'}`}>{editingItem.enabled ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}{editingItem.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="p-4 border rounded-lg hover:border-primary/50 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.keyword}</p>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.reply}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => updateMutation.mutate({ ...item, enabled: !item.enabled })} className={`p-2 rounded-full ${item.enabled ? 'text-success hover:bg-success/10' : 'text-gray-400 hover:bg-gray-100'}`} title={item.enabled ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}>{item.enabled ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}</button>
                    <button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-info rounded-full hover:bg-info/10" title="แก้ไข"><FaEdit /></button>
                    <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-error rounded-full hover:bg-error/10" title="ลบ"><FaTrash /></button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Component Tab สำหรับจัดการข้อความตั้งเวลา
 */
const LineScheduledMessagesTab: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { showConfirmationToast } = useConfirmationToast();

  const { data: messages, isLoading, isError, error } = useQuery<ScheduledMessage[]>({
    queryKey: ['scheduledMessages'],
    queryFn: fetchScheduledMessages,
  });

  const { data: allLineUsers } = useQuery<LineUser[]>({
    queryKey: ['lineUsers'],
    queryFn: fetchLineUsers,
  });

  const linkedUsers = useMemo(() => {
    return allLineUsers?.filter(user => user.customerId) || [];
  }, [allLineUsers]);

  const { paginatedMessages, totalPages } = useMemo(() => {
    if (!messages) return { paginatedMessages: [], totalPages: 1 };
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = messages.slice(startIndex, startIndex + itemsPerPage);
    const pages = Math.ceil(messages.length / itemsPerPage);
    return { paginatedMessages: paginated, totalPages: pages > 0 ? pages : 1 };
  }, [messages, currentPage]);

  const formatThaiDateTime = useCallback((isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZone: 'Asia/Bangkok',
      }).format(date) + ' น.';
    } catch (e) { return 'Invalid Date'; }
  }, []);

  const getStatusChip = useCallback((status: 'pending' | 'sent' | 'failed') => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', sent: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800' };
    const text = { pending: 'รอดำเนินการ', sent: 'ส่งแล้ว', failed: 'ไม่สำเร็จ' };
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
  }, []);

  const deleteMutation = useApiMutation({
    mutationFn: deleteScheduledMessage,
    queryKeyToInvalidate: ['scheduledMessages'],
    successMessage: 'ลบข้อความที่ตั้งเวลาไว้สำเร็จ',
    errorMessage: 'เกิดข้อผิดพลาดในการลบ',
  });

  const handleDelete = useCallback((id: number) => {
    showConfirmationToast({
      title: 'ยืนยันการลบ', message: 'คุณต้องการลบข้อความที่ตั้งเวลานี้ใช่หรือไม่?',
      onConfirm: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation, showConfirmationToast]);

  const handleOpenAddModal = useCallback(() => { setModalMode('add'); setEditingMessage(null); setIsModalOpen(true); }, []);
  const handleOpenEditModal = useCallback((message: ScheduledMessage) => { setModalMode('edit'); setEditingMessage(message); setIsModalOpen(true); }, []);
  const handleCloseModal = useCallback(() => { setIsModalOpen(false); }, []);
  const handleNextPage = useCallback(() => setCurrentPage(prev => Math.min(prev + 1, totalPages)), [totalPages]);
  const handlePrevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  if (isError) showErrorToast(`ไม่สามารถโหลดข้อมูลได้: ${(error as Error)?.message}`);

  return (
    <>
      <ScheduledMessageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        existingMessage={editingMessage}
        linkedUsers={linkedUsers}
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus /> ตั้งเวลาส่งข้อความใหม่
          </button>
        </div>
        {isLoading ? (
          <SkeletonLoader type="list" count={5} className="space-y-3" />
        ) : (
          <div className="space-y-3">
            {messages && messages.length > 0 ? paginatedMessages.map(msg => (
              <div key={msg.id} className="p-4 border rounded-lg hover:shadow-md hover:border-primary/30 transition-all group bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5"><FaClock /><span>{formatThaiDateTime(msg.scheduledAt)}</span></div>
                      <div className="flex items-center gap-1.5"><FaUsers /><span>{msg.recipients.length} ผู้รับ</span></div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    {getStatusChip(msg.status)}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(msg)} className="p-2 text-gray-400 hover:text-info rounded-full hover:bg-info/10" title="แก้ไข" disabled={msg.status === 'sent'}>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(msg.id)} className="p-2 text-gray-400 hover:text-error rounded-full hover:bg-error/10" title="ลบ">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 text-gray-500 border-2 border-dashed rounded-lg">
                <FaPaperPlane className="mx-auto text-4xl mb-4 text-gray-300" />
                <p className="font-semibold text-gray-600">ยังไม่มีข้อความที่ตั้งเวลาไว้</p>
                <p className="text-sm">คลิก "ตั้งเวลาส่งข้อความใหม่" เพื่อเริ่มต้น</p>
              </div>
            )}
          </div>
        )}
        {messages && messages.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            itemsCount={paginatedMessages.length}
            totalItems={messages.length}
            itemName="ข้อความ"
          />
        )}
      </div>
    </>
  );
};

// ===================================================================
//                        MAIN PAGE COMPONENT
// ===================================================================

/**
 * Component หน้าหลักสำหรับบริหารจัดการ Line OA
 */
const LineOAPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'keywords' | 'scheduled'>('users');
  const { isMobile } = useResponsive();

  const tabs = useMemo(() => [
    { id: 'users', label: 'ผู้ใช้งาน', icon: FaUsers, component: <LineUsersTab /> },
    { id: 'keywords', label: 'คีย์เวิร์ด', icon: FaKey, component: <LineKeywordsTab /> },
    { id: 'scheduled', label: 'ตั้งเวลาส่งข้อความ', icon: FaClock, component: <LineScheduledMessagesTab /> },
  ], []);

  const tabOptions = useMemo(() => tabs.map(tab => ({
    value: tab.id,
    label: tab.label,
  })), [tabs]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><FaLine className="h-6 w-6 text-green-600" /></div>
          <div>
            <h1 className="text-2xl font-bold font-sans text-gray-900">บริหารจัดการ Line OA</h1>
            <p className="text-sm text-gray-600 mt-1">จัดการข้อมูลผู้ใช้และข้อความตอบกลับอัตโนมัติ</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-2">
        {isMobile ? (
          <div className="p-2">
            <CustomDropdown
              value={activeTab}
              onChange={(value) => setActiveTab(value as any)}
              options={tabOptions}
              showSearch={false}
            />
          </div>
        ) : (
          <div className="flex space-x-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === tab.id ? 'bg-primary text-white shadow-button' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 min-h-[400px]">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default LineOAPage;