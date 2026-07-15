"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserStreak: (streak: IUser['streak']) => void;
  updateUser: (updatedUser: IUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('mindease_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get<{ success: boolean; user: IUser }>('/api/auth/me');
          if (res.success) {
            setUser(res.user);
          } else {
            // Token invalid
            logout();
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; token: string; user: IUser }>('/api/auth/login', {
        email,
        password,
      });

      if (res.success) {
        localStorage.setItem('mindease_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; token: string; user: IUser }>('/api/auth/register', {
        username,
        email,
        password,
      });

      if (res.success) {
        localStorage.setItem('mindease_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        router.push('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('mindease_token');
    setToken(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const updateUserStreak = (streak: IUser['streak']) => {
    if (user) {
      setUser({ ...user, streak });
    }
  };

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserStreak, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
