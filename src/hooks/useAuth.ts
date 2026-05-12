'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { JWTPayload } from '@/lib/jwt-utils';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: JWTPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        // Decode token to verify it's valid
        const parts = storedToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is expired
          if (payload.exp && Date.now() < payload.exp * 1000) {
            setAccessToken(storedToken);
            setUser(payload);
          } else {
            // Token expired, clear it
            localStorage.removeItem('accessToken');
            refreshTokenHandler();
          }
        }
      } catch (error) {
        console.error('Failed to parse stored token:', error);
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[useAuth] Login attempt for:', email);
      
      const response = await fetch('/api/auth/jwt-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('[useAuth] Response status:', response.status);
      console.log('[useAuth] Response OK:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('[useAuth] Login error:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('[useAuth] Response data received:', {
        hasAccessToken: !!data.accessToken,
        hasUser: !!data.user,
        userRole: data.user?.role,
        accessTokenLength: data.accessToken?.length,
      });
      
      if (!data.accessToken) {
        throw new Error('No access token in response');
      }
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      setAccessToken(data.accessToken);
      setUser(data.user);

      console.log('[useAuth] Login successful for user:', data.user?.email);
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('[useAuth] Login error:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    // Clear server-side httpOnly cookies via API
    fetch('/api/auth/jwt-logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    // Clear client-side storage
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
    Cookies.remove('refreshToken');
    Cookies.remove('accessToken');
    
    // Clear browser history and redirect to login
    if (typeof window !== 'undefined') {
      // Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Replace current history entry with login page
      window.history.replaceState(null, '', '/login');
      
      // Add event listener to prevent back navigation
      const preventBack = () => {
        window.history.pushState(null, '', '/login');
      };
      
      window.addEventListener('popstate', preventBack);
      
      // Navigate to login page with replace to prevent back button
      window.location.replace('/login');
    }
  }, []);

  const refreshTokenHandler = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/jwt-refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      setAccessToken(data.accessToken);

      // Decode new token to update user
      const parts = data.accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setUser(payload);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [logout]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    accessToken,
    login,
    logout,
    refreshToken: refreshTokenHandler,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Hook to automatically refresh token before expiry
 */
export function useAutoRefreshToken() {
  const { accessToken, refreshToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) return;

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return;

      // Refresh token 5 minutes before expiry
      const expiresIn = payload.exp * 1000 - Date.now();
      const refreshTime = expiresIn - 5 * 60 * 1000; // 5 minutes before expiry

      if (refreshTime <= 0) {
        // Token already expired or expiring soon
        refreshToken();
        return;
      }

      const timer = setTimeout(() => {
        refreshToken();
      }, refreshTime);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Failed to setup token refresh:', error);
    }
  }, [accessToken, refreshToken]);
}
