// src/api/ApiCollection.tsx

import axios from 'axios';
import type { Customer, FormattedCustomer, PieChartData, BarChartData, AreaChartData } from '@api/types';
import { API_BASE_URL, API_CONFIG, STORAGE_KEYS } from '@/config';

// Create axios instance with optimized configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Axios request interceptor.
 * Automatically attaches the JWT token to the Authorization header for every request.
 */
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isVerify2faError = error.config.url === '/auth/verify-2fa';

    if (error.response?.status === 401 && !isVerify2faError) {
      localStorage.removeItem(STORAGE_KEYS.auth.token);
      localStorage.removeItem(STORAGE_KEYS.auth.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.auth.lastLogin);
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

// ===================================================================
//                        Data Transformation Utilities
// ===================================================================

const formatCustomerData = (customer: Customer): FormattedCustomer => ({
  id: customer.id,
  title: customer.title,
  name: customer.name,
  lastName: customer.lastname,
  idCard: customer.idcard,
  phone: customer.phone,
  personalType: customer.personal_type,
  carType: customer.car_type,
  carBrand: customer.car_brand,
  carBody: customer.car_body,
  wantedGroup: customer.wanted_group,
  wantedNo: customer.wanted_no,
  dateReserve: customer.date_reserve,
  amount: customer.amount,
  status: customer.status,
  published: customer.published,
  pdf: customer.pdf || undefined,
});

// ===================================================================
//                        AUTH & PROFILE API
// ===================================================================

export const login = (credentials: object) => apiClient.post('/auth/login', credentials).then(res => res.data);
export const verify2FA = (data: { userId: number; code: string }) => apiClient.post('/auth/verify-2fa', data).then(res => res.data);
export const logout = () => apiClient.post('/auth/logout').then(res => res.data);
export const fetchProfile = () => apiClient.get('/profile').then(res => res.data);
export const updateProfile = (profileData: object) => apiClient.put('/profile', profileData).then(res => res.data);
export const changePassword = (passwordData: object) => apiClient.put('/profile/password', passwordData).then(res => res.data);

export const uploadProfilePicture = async (formData: FormData) => {
  const response = await apiClient.post('/profile/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===================================================================
//                        CUSTOMER API
// ===================================================================

export const fetchCustomer = async (): Promise<FormattedCustomer[]> => {
  const response = await apiClient.get<Customer[]>('/customer/fetch');
  return response.data.map(formatCustomerData);
};
export const addCustomer = (customerData: object) => apiClient.post('/customer/v2/customer', customerData).then(res => res.data);
export const updateCustomer = (id: string | number, customerData: object) => apiClient.put(`/customer/${id}`, customerData).then(res => res.data);
export const deleteCustomer = (id: string | number) => apiClient.delete('/customer/v2/customer', { params: { id } }).then(res => res.data);

export const fetchCustomerStatus = async (): Promise<PieChartData[]> => {
  const response = await apiClient.get<PieChartData[]>('/customer/status');
  const statusNames: Record<string, string> = {
    'Completed': 'จองสำเร็จ', 'Pending': 'รอจอง', 'Cancelled': 'จองไม่สำเร็จ'
  };
  return response.data.map(item => ({ ...item, name: statusNames[item.name] || item.name }));
};

export const fetchMonthlyRevenue = async (): Promise<BarChartData[]> => {
  const response = await apiClient.get<BarChartData[]>('/customer/monthly-revenue');
  const monthNames: Record<string, string> = {
    'January': 'ม.ค.', 'February': 'ก.พ.', 'March': 'มี.ค.', 'April': 'เม.ย.',
    'May': 'พ.ค.', 'June': 'มิ.ย.', 'July': 'ก.ค.', 'August': 'ส.ค.',
    'September': 'ก.ย.', 'October': 'ต.ค.', 'November': 'พ.ย.', 'December': 'ธ.ค.'
  };
  return response.data.map(item => ({ ...item, name: monthNames[item.name] || item.name }));
};

export const toggleCustomerPublished = (id: string | number) => apiClient.put(`/customer/toggle-publish/${id}`).then(res => res.data);
export const getCalendarData = () => apiClient.get('/customer/calendar').then(res => res.data);

// ===================================================================
//                        DASHBOARD & CHARTS API
// ===================================================================

interface RevenueDataItem {
  month: string;
  car_type: 'CAR' | 'VAN' | 'TRUCK' | 'MC';
  total_amount: string;
}

export const fetchTotalRevenueByCarType = async (): Promise<{ chartAreaData: AreaChartData[] }> => {
  const response = await apiClient.get<RevenueDataItem[]>('/customer/revenue');
  const groupedData = response.data.reduce<Record<string, Record<string, number>>>((acc, item) => {
    if (!acc[item.month]) {
      acc[item.month] = { CAR: 0, VAN: 0, TRUCK: 0, MC: 0 };
    }
    acc[item.month][item.car_type] = (acc[item.month][item.car_type] || 0) + parseFloat(item.total_amount);
    return acc;
  }, {});

  const chartData: AreaChartData[] = Object.keys(groupedData).map((month) => ({
    name: month,
    CAR: groupedData[month].CAR || 0,
    VAN: groupedData[month].VAN || 0,
    TRUCK: groupedData[month].TRUCK || 0,
    MC: groupedData[month].MC || 0,
  }));

  return { chartAreaData: chartData };
};

export const fetchTotalProfit = async () => {
  try {
    const response = await apiClient.get<{ date: string; totalAmount: number }[]>('/customer/daily-profit');
    const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    
    const dailyTotals = daysOfWeek.reduce<Record<string, number>>((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});

    response.data.forEach(item => {
      const dayName = daysOfWeek[new Date(item.date).getDay()];
      if (dayName) {
        dailyTotals[dayName] += Number(item.totalAmount) || 0;
      }
    });

    const chartData = daysOfWeek.map(day => ({ name: day, profit: dailyTotals[day] }));
    return { title: 'กำไรรายวัน', color: '#10B981', dataKey: 'profit', chartData };
  } catch (err) {
    console.error("Error fetching or processing profit data:", err);
    const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const emptyChartData = daysOfWeek.map(d => ({ name: d, profit: 0 }));
    return { title: 'กำไรรายวัน', color: '#DC2626', dataKey: 'profit', chartData: emptyChartData };
  }
};

export const fetchRecentReserve = () => apiClient.get('/customer/recentReserve').then(res => res.data);
export const fetchTotalCustomer = () => apiClient.get('/customer/total-customer').then(res => res.data);
export const fetchTotalVehicle = () => apiClient.get('/customer/total-vehicle').then(res => res.data);
export const fetchTotalMoto = () => apiClient.get('/customer/total-moto').then(res => res.data);
export const fetchTotalAmount = () => apiClient.get('/customer/total-amount').then(res => res.data);
export const fetchTotalLogs = async () => {
    // ... (existing implementation)
    return {}
};

// ===================================================================
//                        NOTES, LOGS, EVENTS API
// ===================================================================

export const fetchNotes = (searchTerm?: string) => apiClient.get('/notes', { params: { q: searchTerm } }).then(res => res.data.data || []);
export const addNote = (formData: FormData) => apiClient.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
export const fetchLogs = () => apiClient.get('/logs').then(res => res.data.data || []);
export const fetchEvents = () => apiClient.get('/events').then(res => res.data.data || []);

// ===================================================================
//                        SETTINGS API
// ===================================================================

const createSettingsApi = (endpoint: string, dataKey: string) => ({
  fetch: () => apiClient.get(`/settings/${endpoint}`).then(res => ({ [dataKey]: res.data.data })),
  add: (name: string) => apiClient.post(`/settings/${endpoint}`, { name }).then(res => res.data),
  update: (id: number, name: string) => apiClient.put(`/settings/${endpoint}/${id}`, { name }).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/settings/${endpoint}/${id}`).then(res => res.data),
});

export const { 
  fetch: fetchVehicleBrands, add: addVehicleBrand, update: updateVehicleBrand, delete: deleteVehicleBrand 
} = createSettingsApi('vehicle-brands', 'brands');
export const { 
  fetch: fetchTitles, add: addTitle, update: updateTitle, delete: deleteTitle 
} = createSettingsApi('titles', 'titles');
export const { 
  fetch: fetchPersTypes, add: addPersType, update: updatePersType, delete: deletePersType 
} = createSettingsApi('pers-types', 'persTypes');
export const { 
  fetch: fetchCarTypes, add: addCarType, update: updateCarType, delete: deleteCarType 
} = createSettingsApi('car-types', 'carTypes');

export const fetchVehicleBasicSettings = () => apiClient.get('/settings/vehicle-basic').then(res => ({ settings: res.data.data }));
export const updateVehicleBasicSettings = (settingsData: object) => apiClient.put('/settings/vehicle-basic', settingsData).then(res => res.data);

// ===================================================================
//                        PLATE INFO API
// ===================================================================

export const calculatePlate = (plate: string) => apiClient.post('/plateinfo/calculate', { plate }).then(res => res.data);