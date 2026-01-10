import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, User, SignUpData, SignInData } from '@/services/api';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; message: string }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'waffle_user';

// Helper for web storage fallback
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await storage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.signUp(data);

      if (response.success && response.user) {
        setUser(response.user);
        await storage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        return { success: true, message: response.message };
      }

      return { success: false, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      return { success: false, message };
    }
  };

  const signIn = async (data: SignInData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.signIn(data);

      if (response.success && response.user) {
        setUser(response.user);
        await storage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        return { success: true, message: response.message };
      }

      return { success: false, message: response.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      return { success: false, message };
    }
  };

  const signOut = async () => {
    setUser(null);
    await storage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
