'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { JWTPayload } from '@/lib/jwt-utils';

interface AuthContextType {
  user: JWTPayload | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: verify session with server (source of truth = httpOnly cookie)
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAccessToken(data.accessToken || 'cookie');
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          setUser(null);
          setAccessToken(null);
        }
      } catch (err) {
        console.error('[useAuth] Session init error:', err);
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    initSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/jwt-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      setAccessToken(data.accessToken || 'cookie');
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    // 1. Clear React state immediately so UI reflects logout
    setAccessToken(null);
    setUser(null);

    try {
      // 2. MUST await server logout FIRST — server sets Set-Cookie to clear httpOnly cookies.
      //    accessToken is httpOnly so JS cannot delete it — only the server can.
      //    If we navigate before this resolves, middleware still sees the cookie and
      //    redirects back to dashboard instead of showing login.
      await fetch('/api/auth/jwt-logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // ignore network errors on logout — proceed anyway
    }

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // 3. Full page replace AFTER server has cleared httpOnly cookies.
      //    replace() prevents back-button returning to dashboard.
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
        await logout();
        return false;
      }

      const data = await response.json();
      setAccessToken(data.accessToken || 'cookie');

      if (data.accessToken) {
        try {
          const parts = data.accessToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            setUser(payload);
          }
        } catch (e) {}
      }

      return true;
    } catch (error) {
      console.error('[useAuth] Token refresh failed:', error);
      await logout();
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

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAutoRefreshToken() {
  const { accessToken, refreshToken } = useAuth();

  useEffect(() => {
    if (!accessToken || accessToken === 'cookie') return;

    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return;

      const expiresIn = payload.exp * 1000 - Date.now();
      const refreshTime = expiresIn - 5 * 60 * 1000;

      if (refreshTime <= 0) {
        refreshToken();
        return;
      }

      const timer = setTimeout(() => refreshToken(), refreshTime);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('[useAuth] Failed to setup token refresh:', error);
    }
  }, [accessToken, refreshToken]);
}