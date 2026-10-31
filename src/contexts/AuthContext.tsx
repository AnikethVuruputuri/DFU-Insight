import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  phone: string;
  role: 'patient' | 'doctor' | 'nurse';
  name: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dfu_token'));
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = getApiBaseUrl();

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('dfu_token', newToken);
    localStorage.setItem('dfu_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiUrl}/api/v1/auth/logout`, { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('dfu_token');
    localStorage.removeItem('dfu_user');
    setToken(null);
    setUser(null);
  }, [apiUrl]);

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('dfu_token');
    const cachedUser = localStorage.getItem('dfu_user');

    if (cachedUser && !user) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {}
    }

    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('dfu_user', JSON.stringify(data));
        setToken(savedToken);
      } else if (res.status === 401 || res.status === 404) {
        // Token invalid or user deleted
        localStorage.removeItem('dfu_token');
        localStorage.removeItem('dfu_user');
        setToken(null);
        setUser(null);
      }
    } catch {
      // Backend may be offline or starting up; retain cached user so UI doesn't flicker
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        checkAuth,
        apiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
