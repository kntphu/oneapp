// src/config.ts

// ===================================================================
//                        ENVIRONMENT CONFIGURATION
// ===================================================================

const getEnvironment = (): 'development' | 'production' => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1'
    ? 'development'
    : 'production';
};

const environment = getEnvironment();

// ===================================================================
//                        API BASE URL CONFIGURATION
// ===================================================================

export const API_BASE_URL: string = environment === 'production'
  ? 'https://api.onetabien.com/api/v2'
  : 'http://localhost:5000/api/v2';

// ===================================================================
//                        APPLICATION CONFIGURATION
// ===================================================================

export const APP_CONFIG = {
  name: 'One Platform',
  version: '2.5.9',
  author: 'Development Team',
  description: 'Modern React Dashboard Application',
  environment,
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
} as const;

// ===================================================================
//                        API CLIENT CONFIGURATION
// ===================================================================

export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  baseURL: API_BASE_URL,
  maxConcurrentRequests: 10,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// ===================================================================
//                        UI & LAYOUT CONFIGURATION
// ===================================================================

export const UI_CONFIG = {
  theme: {
    primary: '#FF6B35',
    secondary: '#2C2C2C',
    accent: '#FF8C35',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: {
      primary: '#2C2C2C',
      secondary: '#6C6C6C',
      disabled: '#9AA0A6',
    },
  },
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 50,
  },
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    widescreen: 1440,
  },
  layout: {
    headerHeight: 64,
    sidebarWidth: 280,
    containerMaxWidth: 1440,
    contentPadding: 24,
  },
  performance: {
    debounceDelay: 300,
    throttleDelay: 100,
    lazyLoadOffset: 100,
    virtualScrollThreshold: 100,
    imageOptimization: true,
  },
} as const;

// ===================================================================
//                        REACT QUERY CACHE CONFIGURATION
// ===================================================================

export const CACHE_CONFIG = {
  staleTime: {
    instant: 0,
    short: 1 * 60 * 1000,
    medium: 5 * 60 * 1000,
    long: 30 * 60 * 1000,
    veryLong: 60 * 60 * 1000,
    infinite: Infinity,
  },
  gcTime: {
    short: 5 * 60 * 1000,
    medium: 10 * 60 * 1000,
    long: 60 * 60 * 1000,
    veryLong: 24 * 60 * 60 * 1000,
  },
  refetchInterval: {
    realtime: 5 * 1000,
    frequent: 30 * 1000,
    normal: 60 * 1000,
    rare: 5 * 60 * 1000,
  },
} as const;

// ===================================================================
//                        LOCAL STORAGE KEYS
// ===================================================================

export const STORAGE_KEYS = {
  auth: {
    token: 'auth_token',
    refreshToken: 'refresh_token',
    user: 'user_data',
    lastLogin: 'last_login',
  },
  preferences: {
    theme: 'app_theme',
    language: 'app_language',
    sidebar: 'sidebar_state',
    notifications: 'notification_settings',
  },
  form: {
    savedUsername: 'saved_username',
    rememberMe: 'remember_me',
  },
  cache: {
    version: 'cache_version',
    lastClear: 'last_cache_clear',
  },
} as const;

// ===================================================================
//                        FEATURE FLAGS
// ===================================================================

export const FEATURE_FLAGS = {
  enableAnalytics: environment === 'production',
  enableDarkMode: false,
  enableNotifications: true,
  enableDebugMode: environment === 'development',
  enableLazyLoading: true,
  enableVirtualScroll: true,
  enableOfflineMode: false,
  enableAutoSave: true,
  enableKeyboardShortcuts: true,
} as const;

// ===================================================================
//                        VALIDATION RULES
// ===================================================================

export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  password: {
    minLength: 6,
    maxLength: 50,
    requireUppercase: true,
    requireNumber: true,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^[0-9]{10}$/,
  },
} as const;

// ===================================================================
//                        ERROR MESSAGES
// ===================================================================

export const ERROR_MESSAGES = {
  network: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
  unauthorized: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
  sessionExpired: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  invalidCredentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  serverError: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
  validationError: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
} as const;