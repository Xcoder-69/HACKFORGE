import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type UserProfile } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (phone: string, otpOrPin: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginAdmin: (code?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (data: { name: string; phone: string; district: string; village: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  refreshUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile | null;
  switchRole: (role: 'farmer' | 'admin') => UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const login = async (phone: string, otpOrPin: string) => {
    const res = await authService.login(phone, otpOrPin);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const loginAdmin = async (code?: string) => {
    const res = await authService.loginAdmin(code);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (data: { name: string; phone: string; district: string; village: string }) => {
    const res = await authService.register(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = () => {
    setUser(authService.getCurrentUser());
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = authService.updateProfile(updates);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  const switchRole = (role: 'farmer' | 'admin') => {
    const updated = authService.switchRole(role);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAdmin,
        register,
        logout,
        refreshUser,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

