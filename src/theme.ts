// src/theme.ts

import { createTheme, type ThemeOptions } from '@mui/material/styles';

// ===================================================================
//                        COLOR PALETTE CONFIGURATION
// ===================================================================

/**
 * กำหนดค่าสีหลักที่ใช้ใน Theme ของแอปพลิเคชัน
 */
const palette = {
  primary: {
    main: '#6b4de6',
    light: '#8b6ef0',
    dark: '#5a3dd4',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#2C2C2C',
    light: '#6C6C6C',
    dark: '#1A1A1A',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#2C2C2C',
    secondary: '#6C6C6C',
    disabled: '#9AA0A6',
  },
  grey: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
  error: { main: '#DC2626', light: '#F87171', dark: '#B91C1C', contrastText: '#FFFFFF' },
  warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706', contrastText: '#FFFFFF' },
  success: { main: '#10B981', light: '#6EE7B7', dark: '#059669', contrastText: '#FFFFFF' },
  info: { main: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8', contrastText: '#FFFFFF' },
  divider: 'rgba(0, 0, 0, 0.08)',
};

// ===================================================================
//                        TYPOGRAPHY CONFIGURATION
// ===================================================================

/**
 * กำหนดรูปแบบตัวอักษร (Font) และขนาดต่างๆ
 */
const typography = {
  fontFamily: '"Sarabun", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01562em' },
  h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.00833em' },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0em' },
  h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.00735em' },
  h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0em' },
  h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.0075em' },
  body1: { fontSize: '1rem', lineHeight: 1.6, letterSpacing: '0.00938em' },
  body2: { fontSize: '0.875rem', lineHeight: 1.6, letterSpacing: '0.01071em' },
  button: { textTransform: 'none' as const, fontWeight: 500, letterSpacing: '0.02857em' },
  caption: { fontSize: '0.75rem', lineHeight: 1.66, letterSpacing: '0.03333em' },
  overline: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 2.66, letterSpacing: '0.08333em', textTransform: 'uppercase' as const },
};

// ===================================================================
//                        COMPONENT STYLE OVERRIDES
// ===================================================================

/**
 * กำหนดการแสดงผลเริ่มต้นของ Component ต่างๆ ใน Material UI
 */
const components: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: "#9AA0A6 #F1F3F4",
        "&::-webkit-scrollbar, & *::-webkit-scrollbar": { width: 8, height: 8 },
        "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": { borderRadius: 8, backgroundColor: "#9AA0A6", border: "2px solid #F1F3F4" },
        "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": { borderRadius: 8, backgroundColor: "#F1F3F4" },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 16px',
        transition: 'all 0.2s ease-in-out',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(107, 77, 230, 0.25)',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0)' },
        '&.Mui-disabled': { opacity: 0.6 },
      },
      contained: {
        '&.MuiButton-containedPrimary': {
          background: 'linear-gradient(135deg, #6b4de6 0%, #8b6ef0 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #5a3dd4 0%, #6b4de6 100%)' },
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': { borderWidth: 2 },
      },
      sizeSmall: { padding: '6px 12px', fontSize: '0.875rem' },
      sizeLarge: { padding: '12px 24px', fontSize: '1.125rem' },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          transition: 'all 0.2s ease-in-out',
          '& fieldset': { borderColor: '#E8EAED', borderWidth: 1, transition: 'all 0.2s ease-in-out' },
          '&:hover fieldset': { borderColor: '#6b4de6', borderWidth: 2 },
          '&.Mui-focused fieldset': { borderColor: '#6b4de6', borderWidth: 2 },
          '&.Mui-error fieldset': { borderColor: '#DC2626' },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': { color: '#6b4de6' },
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: 16,
        border: '1px solid #F1F3F4',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      rounded: { borderRadius: 12 },
      elevation1: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
      elevation2: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
      elevation3: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        color: '#2C2C2C',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid #F1F3F4',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #F1F3F4',
        boxShadow: '2px 0 12px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: { borderBottom: '1px solid #F1F3F4' },
      head: { backgroundColor: '#F8F9FA', fontWeight: 600, color: '#2C2C2C' },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        transition: 'all 0.2s ease-in-out',
        '&:hover': { transform: 'scale(1.05)' },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#2C2C2C',
        color: '#FFFFFF',
        fontSize: '0.75rem',
        borderRadius: 8,
        padding: '6px 12px',
      },
      arrow: { color: '#2C2C2C' },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 12, fontSize: '0.875rem' },
    },
  },
};

// ===================================================================
//                        THEME INSTANCE CREATION
// ===================================================================

/**
 * Object ตั้งค่า Theme ทั้งหมด
 */
const themeConfig: ThemeOptions = {
  palette,
  typography,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components,
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
};

/**
 * สร้าง Theme instance จาก `themeConfig` เพื่อนำไปใช้ใน
 */
export const theme = createTheme(themeConfig);