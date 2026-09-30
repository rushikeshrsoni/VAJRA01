import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';
import { useLanguage } from './LanguageContext.js';
import { RegisterFormValues, LoginFormValues } from '../lib/schemas.js';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  preferredLanguage: 'en' | 'hi';
  regionState?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginFormValues) => Promise<void>;
  register: (data: RegisterFormValues) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('croppilot_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('croppilot_token') || null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const { setLanguage } = useLanguage();

  const syncUserData = (newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser) {
      localStorage.setItem('croppilot_user', JSON.stringify(newUser));
      if (newUser.preferredLanguage) {
        setLanguage(newUser.preferredLanguage);
      }
    } else {
      localStorage.removeItem('croppilot_user');
    }

    if (newToken) {
      localStorage.setItem('croppilot_token', newToken);
    } else {
      localStorage.removeItem('croppilot_token');
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('croppilot_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      if (res.data?.user) {
        syncUserData(res.data.user, storedToken);
      }
    } catch {
      syncUserData(null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginFormValues) => {
    const res = await api.post('/auth/login', data);
    const { user: loggedInUser, token: authToken } = res.data;
    syncUserData(loggedInUser, authToken);
  };

  const register = async (data: RegisterFormValues) => {
    const res = await api.post('/auth/register', data);
    const { user: registeredUser, token: authToken } = res.data;
    syncUserData(registeredUser, authToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      syncUserData(null, null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.put('/auth/profile', data);
    if (res.data?.user) {
      syncUserData(res.data.user, token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
