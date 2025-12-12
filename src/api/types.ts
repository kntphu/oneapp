// src/api/types.ts

// ===================================================================
//                        CUSTOMER TYPES
// ===================================================================

/**
 * Interface สำหรับข้อมูลลูกค้าที่ได้รับจาก API (snake_case)
 */
export interface Customer {
  id: number;
  title: string;
  name: string;
  lastname: string;
  idcard: string;
  phone: string;
  personal_type: string;
  car_type: string;
  car_brand: string;
  car_body: string;
  wanted_group: string;
  wanted_no: string;
  date_reserve: string;
  amount: string;
  status: string;
  published: number;
  pdf?: string;
}

/**
 * Interface สำหรับข้อมูลลูกค้าที่ถูกจัดรูปแบบสำหรับใช้งานใน Frontend (camelCase)
 */
export interface FormattedCustomer {
  id: number;
  title: string;
  name: string;
  lastName: string;
  idCard: string;
  phone: string;
  personalType: string;
  carType: string;
  carBrand: string;
  carBody: string;
  wantedGroup: string;
  wantedNo: string;
  dateReserve: string;
  amount: string;
  status: string;
  published: number;
  pdf?: string;
}

/**
 * Interface สำหรับข้อมูลในฟอร์มเพิ่ม/แก้ไขลูกค้า
 */
export interface CustomerFormData {
  title: string;
  name: string;
  lastname: string;
  idcard: string;
  phone: string;
  personal_type: string;
  car_type: string;
  car_brand: string;
  car_body: string;
  wanted_group: string;
  wanted_no: string;
  date_reserve: string;
  amount: string;
  status: string;
}

// ===================================================================
//                        AUTHENTICATION & USER TYPES
// ===================================================================

/**
 * Interface สำหรับข้อมูลที่ใช้ในการ Login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Interface สำหรับข้อมูล User ที่ได้รับหลังจากการ Authenticate
 */
export interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

/**
 * Interface สำหรับ Response ที่ได้จากการ Authenticate
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// ===================================================================
//                        LINE OA TYPES
// ===================================================================

/**
 * Interface สำหรับข้อมูลผู้ใช้งาน Line
 */
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

/**
 * Interface สำหรับข้อมูล Keyword ตอบกลับอัตโนมัติใน Line
 */
export interface LineKeyword {
  id: number;
  keyword: string;
  reply: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface สำหรับข้อมูลผู้รับข้อความที่ตั้งเวลาส่ง
 */
export interface ScheduledMessageRecipient {
  user: {
    id: string;
    displayName: string;
    pictureUrl?: string;
  };
}

/**
 * Interface สำหรับข้อความที่ตั้งเวลาส่งผ่าน Line OA
 */
export interface ScheduledMessage {
  id: number;
  message: string;
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
  recipients: ScheduledMessageRecipient[];
}


// ===================================================================
//                        CHART & DASHBOARD TYPES
// ===================================================================

/**
 * Interface สำหรับข้อมูลดิบของกราฟรายเดือนจาก API
 */
export interface ChartData {
  month: string;
  totalAmount: string;
  customers?: number;
  vehicles?: number;
}

/**
 * Interface สำหรับข้อมูลกราฟวงกลม (Pie Chart)
 */
export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

/**
 * Interface สำหรับข้อมูลกราฟพื้นที่ (Area Chart)
 */
export interface AreaChartData {
  name: string;
  CAR: number;
  VAN: number;
  TRUCK: number;
  MC: number;
}

/**
 * Interface สำหรับข้อมูลกราฟแท่ง (Bar Chart)
 */
export interface BarChartData {
  name: string;
  earning?: number;
  [key: string]: string | number | undefined;
}

/**
 * Interface สำหรับข้อมูลสถิติในหน้า Dashboard
 */
export interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  totalMoto: number;
  currentMonthAmount: number;
  percentageChange: number;
  chartData: ChartData[];
}

// ===================================================================
//                        SETTINGS TYPES
// ===================================================================

/**
 * Interface สำหรับข้อมูลยี่ห้อรถ
 */
export interface VehicleBrand {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface สำหรับข้อมูลคำนำหน้าชื่อ
 */
export interface Title {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface สำหรับข้อมูลประเภทบุคคล
 */
export interface PersonalType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface สำหรับข้อมูลประเภทรถ
 */
export interface CarType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}


// ===================================================================
//                        CALENDAR TYPES
// ===================================================================

/**
 * Interface สำหรับ Event ที่จะแสดงในปฏิทิน
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  extendedProps?: {
    name: string;
    lastname: string;
    number: string;
    phone?: string;
    carType?: string;
    status?: string;
    amount?: string;
  };
}


// ===================================================================
//                        API RESPONSE TYPES
// ===================================================================

/**
 * Interface สำหรับโครงสร้าง Response ทั่วไปจาก API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Interface สำหรับ Response ที่มีการแบ่งหน้า (Pagination)
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface สำหรับ Error ที่ได้รับจาก API
 */
export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: any;
}

// ===================================================================
//                        UTILITY & COMPONENT TYPES
// ===================================================================

/**
 * Type สำหรับสถานะของลูกค้า
 */
export type CustomerStatus = 'pending' | 'Cancelled' | 'Completed';

/**
 * Type สำหรับประเภทของรถยนต์
 */
export type CarTypeValue = 'CAR' | 'VAN' | 'TRUCK' | 'MC';

/**
 * Interface สำหรับสถานะการโหลดข้อมูล
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Interface สำหรับการตั้งค่าการเรียงลำดับข้อมูลในตาราง
 */
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Interface สำหรับการตั้งค่าการกรองข้อมูล
 */
export interface FilterConfig {
  [key: string]: any;
}

/**
 * Interface สำหรับ Props ของ Modal ทั่วไป
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}