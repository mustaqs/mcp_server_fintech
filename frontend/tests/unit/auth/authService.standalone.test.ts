import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Auth service implementation (simplified for testing)
const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      
      return access_token;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },
  
  getToken: () => {
    return localStorage.getItem('access_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });
  
  describe('login', () => {
    it('should store tokens in localStorage on successful login', async () => {
      // Arrange
      const mockResponse = {
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          user: { id: '1', email: 'test@example.com' }
        }
      };
      (axios.post as any).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await authService.login('test@example.com', 'password123');
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorage.getItem('access_token')).toBe('mock_access_token');
      expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token');
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should throw an error when login fails', async () => {
      // Arrange
      const mockError = new Error('Invalid credentials');
      (axios.post as any).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(authService.login('test@example.com', 'wrong_password'))
        .rejects.toThrow('Invalid credentials');
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
        first_name: 'New',
        last_name: 'User'
      };
      const mockResponse = {
        data: {
          id: '2',
          email: 'newuser@example.com',
          username: 'newuser'
        }
      };
      (axios.post as any).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await authService.register(userData);
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
    
    it('should throw an error when registration fails', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };
      const mockError = new Error('User already exists');
      (axios.post as any).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(authService.register(userData))
        .rejects.toThrow('User already exists');
    });
  });
  
  describe('logout', () => {
    it('should remove tokens from localStorage', () => {
      // Arrange
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      
      // Act
      authService.logout();
      
      // Assert
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });
  
  describe('refreshToken', () => {
    it('should refresh the access token successfully', async () => {
      // Arrange
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      const mockResponse = {
        data: {
          access_token: 'new_access_token'
        }
      };
      (axios.post as any).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await authService.refreshToken();
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', {
        refresh_token: 'mock_refresh_token'
      });
      expect(localStorage.getItem('access_token')).toBe('new_access_token');
      expect(result).toBe('new_access_token');
    });
    
    it('should throw an error when no refresh token is available', async () => {
      // Act & Assert
      await expect(authService.refreshToken())
        .rejects.toThrow('No refresh token available');
    });
    
    it('should clear tokens when refresh fails', async () => {
      // Arrange
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      const mockError = new Error('Invalid refresh token');
      (axios.post as any).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(authService.refreshToken())
        .rejects.toThrow('Invalid refresh token');
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });
  
  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      // Arrange
      localStorage.setItem('access_token', 'mock_access_token');
      
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should return false when access token does not exist', () => {
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(false);
    });
  });
});
