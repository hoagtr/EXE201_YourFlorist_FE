import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { 
    email: string; 
    password: string; 
    name: string; 
    address: string; 
    phone: string; 
    gender: 'Male' | 'Female' | 'Other';
  }) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('user');
    console.log('AuthContext: Initializing user from localStorage:', savedUser);
    
    // Check if savedUser exists and is not null/undefined before parsing
    if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing user from localStorage:', error);
        // Remove invalid data from localStorage
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: useEffect - token exists:', !!token);
    
    if (token) {
      console.log('AuthContext: Calling getCurrentUser...');
      apiService.getCurrentUser()
        .then(user => {
          console.log('AuthContext: getCurrentUser success:', user);
          setUser(user);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        })
        .catch((error) => {
          console.error('AuthContext: Failed to get current user:', error);
          // Only remove token and user if it's an authentication error (401)
          if (error.message.includes('Authentication failed') || error.message.includes('401')) {
            console.log('AuthContext: Removing token and user due to auth error');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            console.log('AuthContext: Keeping existing user data for non-auth error');
          }
          // For other errors (network, etc.), keep the existing user data from localStorage
        })
        .finally(() => setLoading(false));
    } else {
      console.log('AuthContext: No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Login attempt for:', email);
      const token = await apiService.login({ email, password });
      console.log('AuthContext: Login successful, token:', token);
      localStorage.setItem('token', token);
      // Now fetch the user profile
      const user = await apiService.getCurrentUser();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const register = async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    address: string; 
    phone: string; 
    gender: 'Male' | 'Female' | 'Other';
  }) => {
    try {
      console.log('AuthContext: Register attempt for:', userData.email);
      const user = await apiService.register(userData);
      console.log('AuthContext: Register successful, user:', user);
      // For registration, we need to get a token by logging in after successful registration
      const token = await apiService.login({ email: userData.email, password: userData.password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error('AuthContext: Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('You must be logged in to change your password.');
    }
    
    try {
      console.log('AuthContext: Change password attempt');
      await apiService.changePassword(user.id, currentPassword, newPassword);
      console.log('AuthContext: Password changed successfully');
    } catch (error) {
      console.error('AuthContext: Change password error:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      console.log('AuthContext: Request password reset for:', email);
      await apiService.requestPasswordReset(email);
      console.log('AuthContext: Password reset email sent successfully');
    } catch (error) {
      console.error('AuthContext: Request password reset error:', error);
      throw error;
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      console.log('AuthContext: Confirm password reset');
      await apiService.confirmPasswordReset(token, newPassword);
      console.log('AuthContext: Password reset confirmed successfully');
    } catch (error) {
      console.error('AuthContext: Confirm password reset error:', error);
      throw error;
    }
  };

  console.log('AuthContext: Current user state:', user);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 