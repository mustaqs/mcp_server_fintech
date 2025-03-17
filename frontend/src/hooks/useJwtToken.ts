import { useState, useEffect, useCallback } from 'react';
import { refreshToken } from '@/services/authService';

interface UseJwtTokenReturn {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  isTokenExpired: (token: string) => boolean;
  refreshTokenIfNeeded: () => Promise<string | null>;
}

/**
 * Custom hook for JWT token storage and management
 */
export const useJwtToken = (): UseJwtTokenReturn => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);

  // Initialize tokens from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccessToken = localStorage.getItem('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      setAccessToken(storedAccessToken);
      setRefreshTokenValue(storedRefreshToken);
    }
  }, []);

  /**
   * Get the current access token
   */
  const getAccessToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return accessToken;
  }, [accessToken]);

  /**
   * Get the current refresh token
   */
  const getRefreshToken = useCallback((): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return refreshTokenValue;
  }, [refreshTokenValue]);

  /**
   * Set both access and refresh tokens
   */
  const setTokens = useCallback((newAccessToken: string, newRefreshToken: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', newAccessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    
    setAccessToken(newAccessToken);
    setRefreshTokenValue(newRefreshToken);
  }, []);

  /**
   * Clear all tokens
   */
  const clearTokens = useCallback((): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    
    setAccessToken(null);
    setRefreshTokenValue(null);
  }, []);

  /**
   * Check if a token is expired
   */
  const isTokenExpired = useCallback((token: string): boolean => {
    if (!token) return true;
    
    try {
      // Decode the token payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }, []);

  /**
   * Refresh the access token if needed
   */
  const refreshTokenIfNeeded = useCallback(async (): Promise<string | null> => {
    const currentAccessToken = getAccessToken();
    const currentRefreshToken = getRefreshToken();
    
    // If no tokens, return null
    if (!currentAccessToken || !currentRefreshToken) {
      return null;
    }
    
    // If access token is not expired, return it
    if (!isTokenExpired(currentAccessToken)) {
      return currentAccessToken;
    }
    
    try {
      // Refresh the token
      const response = await refreshToken(currentRefreshToken);
      
      // Update tokens
      setTokens(response.access_token, response.refresh_token);
      
      return response.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearTokens();
      return null;
    }
  }, [getAccessToken, getRefreshToken, isTokenExpired, setTokens, clearTokens]);

  return {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    isTokenExpired,
    refreshTokenIfNeeded,
  };
};
