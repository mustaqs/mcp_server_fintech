import axios from 'axios';
import { User, LoginRequest, RegisterRequest, TokenResponse } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (!refreshTokenValue) {
          // No refresh token, redirect to login
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
        
        // Try to refresh token
        const response = await refreshToken(refreshTokenValue);
        
        // Update tokens in localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Update auth header
        originalRequest.headers['Authorization'] = `Bearer ${response.access_token}`;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/token', {
      username: email, // The backend expects 'username' for email
      password,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to login. Please check your credentials.'
    );
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to register. Please try again.'
    );
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to refresh token.'
    );
  }
};

export const logoutUser = async () => {
  try {
    // Call logout endpoint if needed
    // await api.post('/api/auth/logout');
    
    // For now, just clear tokens on client side
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error: any) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to get user data.'
    );
  }
};

export const initiateOAuthLogin = (provider: string) => {
  window.location.href = `${API_URL}/api/auth/oauth/${provider}`;
};

export const initiateSamlLogin = () => {
  window.location.href = `${API_URL}/api/auth/saml/login`;
};

export const resetPassword = async (email: string) => {
  try {
    const response = await api.post('/api/auth/reset-password', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to send password reset email. Please try again.'
    );
  }
};

export const resetPasswordConfirm = async (token: string, password: string) => {
  try {
    const response = await api.post('/api/auth/reset-password-confirm', { token, password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to reset password. Please try again.'
    );
  }
};
