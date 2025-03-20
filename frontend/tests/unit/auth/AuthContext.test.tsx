import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as authService from '@/services/authService';

// Mock the auth service
jest.mock('@/services/authService');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-email">{user.email}</div>
      )}
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="register-button" 
        onClick={() => register({
          email: 'new@example.com',
          password: 'password',
          username: 'newuser',
          first_name: 'New',
          last_name: 'User'
        })}
      >
        Register
      </button>
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Clear localStorage
    localStorage.clear();
  });
  
  test('initial state should be unauthenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });
  
  test('login should authenticate the user', async () => {
    // Mock the login service to return a successful response
    const mockUser = { 
      id: '123', 
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false
    };
    
    (authService.login as jest.Mock).mockResolvedValue({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click the login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    // Wait for the auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Verify the login service was called with correct parameters
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Verify tokens were stored in localStorage
    expect(localStorage.getItem('access_token')).toBe('mock-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
  });
  
  test('register should create a new user and authenticate', async () => {
    // Mock the register service to return a successful response
    const mockUser = { 
      id: '456', 
      email: 'new@example.com',
      username: 'newuser',
      is_admin: false
    };
    
    (authService.register as jest.Mock).mockResolvedValue({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click the register button
    await act(async () => {
      userEvent.click(screen.getByTestId('register-button'));
    });
    
    // Wait for the auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    });
    
    // Verify the register service was called with correct parameters
    expect(authService.register).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      username: 'newuser',
      first_name: 'New',
      last_name: 'User'
    });
    
    // Verify tokens were stored in localStorage
    expect(localStorage.getItem('access_token')).toBe('mock-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token');
  });
  
  test('logout should clear authentication state', async () => {
    // First login to set the authenticated state
    const mockUser = { 
      id: '123', 
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false
    };
    
    (authService.login as jest.Mock).mockResolvedValue({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    // Verify authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Now logout
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-button'));
    });
    
    // Verify unauthenticated state
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
    
    // Verify tokens were removed from localStorage
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
  
  test('should restore auth state from localStorage on mount', async () => {
    // Setup localStorage with tokens
    localStorage.setItem('access_token', 'mock-access-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    
    // Mock the getCurrentUser service to return a user
    const mockUser = { 
      id: '123', 
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false
    };
    
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the auth state to be restored
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
    
    // Verify getCurrentUser was called
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });
});
