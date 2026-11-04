import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  api,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
} from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!getStoredAccessToken();
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('baton_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Synchronize authenticated user profile on application startup
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const token = getStoredAccessToken();
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.success && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('baton_user', JSON.stringify(response.data.user));
          localStorage.setItem('baton_auth', 'true');
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[Auth] Session validation failed:', err.message);
          clearStoredTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Listen for automatic session expiry from apiClient
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('baton_session_expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('baton_session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (credentials = {}) => {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe,
    });

    if (response.success && response.data) {
      const { token, refreshToken, user: userData } = response.data;
      setStoredTokens(token, refreshToken);
      localStorage.setItem('baton_auth', 'true');
      localStorage.setItem('baton_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const signup = async (details = {}) => {
    const response = await api.post('/auth/signup', {
      fullName: details.fullName,
      email: details.email,
      password: details.password,
    });

    if (response.success && response.data) {
      const { token, refreshToken, user: userData } = response.data;
      setStoredTokens(token, refreshToken);
      localStorage.setItem('baton_auth', 'true');
      localStorage.setItem('baton_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return response.data;
    } else {
      throw new Error(response.message || 'Signup failed');
    }
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('[Auth] Logout notification to server failed:', err.message);
    } finally {
      clearStoredTokens();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('baton_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
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
