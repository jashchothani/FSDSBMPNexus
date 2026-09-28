'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  gamification?: {
    xp: number;
    streak: number;
    rating: number;
    rank?: string;
    problemsSolved: number;
    wins?: number;
    losses?: number;
    totalMatches?: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('sbmp_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const data = await res.json();

      if (res.ok && data.success && data.data?.user) {
        const u = data.data.user;
        const formattedUser: User = {
          id: u._id || u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          avatar: u.avatar,
          gamification: u.gamification || { xp: 0, streak: 0, rating: 1200, problemsSolved: 0 },
        };
        setUser(formattedUser);
        setToken(savedToken);
        localStorage.setItem('sbmp_user', JSON.stringify(formattedUser));
      } else {
        // Token invalid or expired — clear session
        localStorage.removeItem('sbmp_token');
        localStorage.removeItem('sbmp_user');
        document.cookie = 'sbmp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(null);
        setToken(null);
      }
    } catch {
      // In case of network error, keep local storage snapshot if present, else null
      const savedUser = localStorage.getItem('sbmp_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch {
          setUser(null);
          setToken(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const u = data.data.user;
        const t = data.data.tokens?.accessToken;

        const formattedUser: User = {
          id: u._id || u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          avatar: u.avatar,
          gamification: u.gamification || { xp: 0, streak: 0, rating: 1200, problemsSolved: 0 },
        };

        setUser(formattedUser);
        setToken(t);
        localStorage.setItem('sbmp_token', t);
        localStorage.setItem('sbmp_user', JSON.stringify(formattedUser));
        document.cookie = `sbmp_token=${t}; path=/; max-age=604800`;
        return { success: true };
      } else {
        const errorMsg = data.error?.message || data.message || 'Invalid email or password';
        return { success: false, error: errorMsg };
      }
    } catch {
      return { success: false, error: 'Could not connect to authentication server' };
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        return login(data.email, data.password);
      } else {
        let errorMsg = resData.error?.message || resData.message || 'Registration failed';
        if (Array.isArray(resData.error?.details) && resData.error.details.length > 0) {
          errorMsg = resData.error.details.map((d: any) => d.message || d).join('. ');
        }
        return { success: false, error: errorMsg };
      }
    } catch {
      return { success: false, error: 'Could not connect to server' };
    }
  };

  const logout = () => {
    if (token) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('sbmp_token');
    localStorage.removeItem('sbmp_user');
    document.cookie = 'sbmp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
