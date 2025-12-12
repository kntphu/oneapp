// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, fetchProfile } from '@api/ApiCollection';
import { STORAGE_KEYS, ERROR_MESSAGES } from '@/config';
import { showErrorToast, showInfoToast } from '@utils/toastUtils';

// ===================================================================
//                        INTERFACE DEFINITIONS
// ===================================================================

interface User {
  id: number;
  username: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  nickName?: string;
  phone?: string;
  address?: string;
  role?: string;
  userRole?: string;
  profilePicture?: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ===================================================================
//                        CONTEXT CREATION
// ===================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===================================================================
//                        HELPER FUNCTIONS
// ===================================================================

const normalizeUserData = (apiUser: any): User => {
  let profilePicUrl = apiUser.profilePicture || apiUser.avatar;

  if (profilePicUrl && profilePicUrl.startsWith('http://')) {
    profilePicUrl = profilePicUrl.replace('http://', 'https://');
  }

  return {
    id: apiUser.id,
    username: apiUser.username || apiUser.email || '',
    email: apiUser.email,
    name: apiUser.name || apiUser.firstName,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    nickName: apiUser.nickName,
    phone: apiUser.phone,
    address: apiUser.address,
    role: apiUser.role || apiUser.userRole,
    userRole: apiUser.userRole || apiUser.role,
    profilePicture: profilePicUrl,
    lastLogin: apiUser.lastLogin,
    isActive: apiUser.isActive !== undefined ? apiUser.isActive : true,
  };
};

// ===================================================================
//                        AUTH PROVIDER COMPONENT
// ===================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.auth.token);
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const profileResponse = await fetchProfile();
      
      if (profileResponse?.user) {
        const userData = normalizeUserData(profileResponse.user);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid profile response');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem(STORAGE_KEYS.auth.token);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<any> => {
    setIsLoading(true);
    try {
      const response = await apiLogin({
        username: credentials.username,
        password: credentials.password,
      });

      return response; 
      
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage: string = ERROR_MESSAGES.network;
      
      if (error.response) {
        errorMessage = error.response.data?.error || ERROR_MESSAGES.invalidCredentials;
      }
      
      showErrorToast(errorMessage);
      throw error;
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiLogout().catch(err => console.warn('Logout API call failed:', err));
    } finally {
      localStorage.removeItem(STORAGE_KEYS.auth.token);
      localStorage.removeItem(STORAGE_KEYS.auth.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.auth.lastLogin);
      
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      showInfoToast('ออกจากระบบเรียบร้อยแล้ว');
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
    updateUser,
  }), [user, isAuthenticated, isLoading, login, logout, checkAuth, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===================================================================
//                        CUSTOM HOOK
// ===================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};