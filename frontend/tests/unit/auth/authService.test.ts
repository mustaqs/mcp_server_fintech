import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
} from '@/services/authService';

// Create a mock for axios
const mockAxios = new MockAdapter(axios);

describe('authService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockAxios.reset();
    localStorage.clear();
  });

  describe('login', () => {
    test('should return user and tokens on successful login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          is_admin: false,
        },
      };

      mockAxios.onPost('/api/auth/login').reply(200, mockResponse);

      // Act
      const result = await login(email, password);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });

    test('should throw error on failed login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      const errorMessage = 'Invalid credentials';

      mockAxios.onPost('/api/auth/login').reply(401, { detail: errorMessage });

      // Act & Assert
      await expect(login(email, password)).rejects.toThrow(errorMessage);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('register', () => {
    test('should return user and tokens on successful registration', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
        first_name: 'New',
        last_name: 'User',
      };
      const mockResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '456',
          email: 'new@example.com',
          username: 'newuser',
          is_admin: false,
        },
      };

      mockAxios.onPost('/api/auth/register').reply(201, mockResponse);

      // Act
      const result = await register(userData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
    });

    test('should throw error on failed registration', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser',
        first_name: 'Existing',
        last_name: 'User',
      };
      const errorMessage = 'Email already registered';

      mockAxios.onPost('/api/auth/register').reply(400, { detail: errorMessage });

      // Act & Assert
      await expect(register(userData)).rejects.toThrow(errorMessage);
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('logout', () => {
    test('should clear tokens from localStorage', () => {
      // Arrange
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');

      // Act
      logout();

      // Assert
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('refreshToken', () => {
    test('should update tokens on successful refresh', async () => {
      // Arrange
      const oldRefreshToken = 'old-refresh-token';
      localStorage.setItem('refresh_token', oldRefreshToken);

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAxios.onPost('/api/auth/refresh').reply(200, mockResponse);

      // Act
      const result = await refreshToken();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
    });

    test('should throw error on failed refresh', async () => {
      // Arrange
      const oldRefreshToken = 'invalid-refresh-token';
      localStorage.setItem('refresh_token', oldRefreshToken);

      const errorMessage = 'Invalid refresh token';
      mockAxios.onPost('/api/auth/refresh').reply(401, { detail: errorMessage });

      // Act & Assert
      await expect(refreshToken()).rejects.toThrow(errorMessage);
    });
  });

  describe('forgotPassword', () => {
    test('should return success message on successful request', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = { message: 'Password reset email sent' };

      mockAxios.onPost('/api/auth/forgot-password').reply(200, mockResponse);

      // Act
      const result = await forgotPassword(email);

      // Assert
      expect(result).toEqual(mockResponse);
    });

    test('should throw error if email is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const errorMessage = 'User not found';

      mockAxios.onPost('/api/auth/forgot-password').reply(404, { detail: errorMessage });

      // Act & Assert
      await expect(forgotPassword(email)).rejects.toThrow(errorMessage);
    });
  });

  describe('resetPassword', () => {
    test('should return success message on successful reset', async () => {
      // Arrange
      const token = 'valid-reset-token';
      const newPassword = 'new-password123';
      const mockResponse = { message: 'Password reset successful' };

      mockAxios.onPost('/api/auth/reset-password').reply(200, mockResponse);

      // Act
      const result = await resetPassword(token, newPassword);

      // Assert
      expect(result).toEqual(mockResponse);
    });

    test('should throw error if token is invalid', async () => {
      // Arrange
      const token = 'invalid-reset-token';
      const newPassword = 'new-password123';
      const errorMessage = 'Invalid or expired token';

      mockAxios.onPost('/api/auth/reset-password').reply(400, { detail: errorMessage });

      // Act & Assert
      await expect(resetPassword(token, newPassword)).rejects.toThrow(errorMessage);
    });
  });

  describe('verifyEmail', () => {
    test('should return success message on successful verification', async () => {
      // Arrange
      const token = 'valid-verification-token';
      const mockResponse = { message: 'Email verified successfully' };

      mockAxios.onGet(`/api/auth/verify-email/${token}`).reply(200, mockResponse);

      // Act
      const result = await verifyEmail(token);

      // Assert
      expect(result).toEqual(mockResponse);
    });

    test('should throw error if token is invalid', async () => {
      // Arrange
      const token = 'invalid-verification-token';
      const errorMessage = 'Invalid or expired token';

      mockAxios.onGet(`/api/auth/verify-email/${token}`).reply(400, { detail: errorMessage });

      // Act & Assert
      await expect(verifyEmail(token)).rejects.toThrow(errorMessage);
    });
  });

  describe('getCurrentUser', () => {
    test('should return user data if authenticated', async () => {
      // Arrange
      localStorage.setItem('access_token', 'valid-access-token');
      
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        is_admin: false,
      };

      mockAxios.onGet('/api/users/me').reply(200, mockUser);

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
    });

    test('should throw error if not authenticated', async () => {
      // Arrange - no token in localStorage
      const errorMessage = 'Not authenticated';

      mockAxios.onGet('/api/users/me').reply(401, { detail: errorMessage });

      // Act & Assert
      await expect(getCurrentUser()).rejects.toThrow(errorMessage);
    });
  });
});
