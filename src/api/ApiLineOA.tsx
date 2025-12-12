// src/api/ApiLineOA.tsx

import axios from 'axios';
import { STORAGE_KEYS } from '@/config';
import type { FormattedCustomer } from './types';

export interface LineUser {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  conversationStage: string;
  createdAt: string;
  updatedAt: string;
  customerId?: number | null;
  customer?: FormattedCustomer | null;
}

export interface LineKeyword {
  id: number;
  keyword: string;
  reply: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const LINE_OA_API_BASE_URL = 'https://chat.onetabien.com/api/v2';

const lineApiClient = axios.create({
  baseURL: LINE_OA_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

lineApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.auth.token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

lineApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);


// ===================================================================
//                        LINE OA MANAGEMENT API
// ===================================================================

export const fetchLineUsers = () => lineApiClient.get('/line/users').then(res => res.data.data as LineUser[]);
export const updateLineUser = (id: string, data: { displayName: string }) => {
  return lineApiClient.put(`/line/users/${id}`, data).then(res => res.data);
};

export const fetchLineKeywords = () => lineApiClient.get('/line/keywords').then(res => res.data.data as LineKeyword[]);
export const addLineKeyword = (data: { keyword: string; reply: string; enabled?: boolean }) => lineApiClient.post('/line/keywords', data).then(res => res.data);
export const updateLineKeyword = (id: number, data: Partial<Omit<LineKeyword, 'id' | 'createdAt' | 'updatedAt'>>) => lineApiClient.put(`/line/keywords/${id}`, data).then(res => res.data);
export const deleteLineKeyword = (id: number) => lineApiClient.delete(`/line/keywords/${id}`).then(res => res.data);

export const fetchScheduledMessages = () => lineApiClient.get('/line/scheduled-messages').then(res => res.data.data);
export const createScheduledMessage = (data: { message: string; scheduledAt: string; recipientUserIds: string[] }) => lineApiClient.post('/line/scheduled-messages', data).then(res => res.data);
export const updateScheduledMessage = (id: number, data: { message?: string; scheduledAt?: string; recipientUserIds?: string[] }) => lineApiClient.put(`/line/scheduled-messages/${id}`, data).then(res => res.data);
export const deleteScheduledMessage = (id: number) => lineApiClient.delete(`/line/scheduled-messages/${id}`).then(res => res.data);

// ===================================================================
//          [เพิ่ม] API for Linking Customer to Line User
// ===================================================================

export const linkCustomerToLineUser = (lineUserId: string, customerId: number) => {
  return lineApiClient.post('/line/users/link', { lineUserId, customerId }).then(res => res.data);
};

export const unlinkCustomerFromLineUser = (lineUserId: string) => {
  return lineApiClient.delete('/line/users/link', { data: { lineUserId } }).then(res => res.data);
};