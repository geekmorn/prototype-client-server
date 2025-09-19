import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserCreate } from '../types';
import { apiClient, setGlobalResetAuth } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resetAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Set up global resetAuth function for API client
  useEffect(() => {
    setGlobalResetAuth(resetAuth);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser); // Update user data with fresh data from server
        } catch (error) {
          // Token is invalid, clear storage and reset auth state
          resetAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('[Auth] Starting login process...');
      const tokenData = await apiClient.login({ email, password });
      console.log('[Auth] Login successful, received token:', tokenData.access_token.substring(0, 20) + '...');
      
      // Store token in localStorage BEFORE making getCurrentUser call
      localStorage.setItem('token', tokenData.access_token);
      setToken(tokenData.access_token);
      console.log('[Auth] Token stored in localStorage and state');
      
      // Now get current user with the token properly set in headers
      console.log('[Auth] Calling getCurrentUser with token in headers...');
      const userData = await apiClient.getCurrentUser();
      console.log('[Auth] getCurrentUser successful, user data:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: UserCreate) => {
    try {
      await apiClient.signup(userData);
      // Auto-login after signup
      await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    resetAuth();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    resetAuth,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
