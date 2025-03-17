import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, RegisterRequest } from '../types/user';
import { loginUser, registerUser, refreshToken, logoutUser, getCurrentUser, resetPassword as resetPasswordService, resetPasswordConfirm as resetPasswordConfirmService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordConfirm: (token: string, password: string) => Promise<void>;
  error: string | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
          setIsLoading(false);
          return;
        }
        
        // Verify token and get user data
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Try to refresh the token
        try {
          const refreshTokenValue = localStorage.getItem('refresh_token');
          if (refreshTokenValue) {
            const tokens = await refreshToken(refreshTokenValue);
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            
            // Get user data with new token
            const userData = await getCurrentUser();
            setUser(userData);
          }
        } catch (refreshErr) {
          // If refresh fails, clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Get user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(userData);
      
      // Auto-login after registration
      await login(userData.email, userData.password);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      console.error('Registration error:', err);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    
    try {
      // Call logout API
      logoutUser();
      
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Clear user state
      setUser(null);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

    const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPasswordService(email);
      // Don't return a value to match Promise<void> return type
    } catch (err: any) {
      setError(err.message || 'Failed to send reset password email');
      console.error('Reset password error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordConfirm = async (token: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPasswordConfirmService(token, password);
      // Don't return a value to match Promise<void> return type
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      console.error('Reset password confirm error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        resetPassword,
        resetPasswordConfirm,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
