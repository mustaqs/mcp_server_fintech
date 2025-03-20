import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';

// Mock auth service
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  getToken: vi.fn(),
  isAuthenticated: vi.fn(),
};

// Auth context implementation (simplified for testing)
const AuthContext = React.createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAuthService.login(email, password);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAuthService.register(userData);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    mockAuthService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: () => !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, error, login, register, logout, isAuthenticated } = useContext(AuthContext);
  
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      {user && <div data-testid="user-info">Welcome, {user.email}</div>}
      
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      
      <button 
        data-testid="register-button" 
        onClick={() => register({ email: 'new@example.com', password: 'password123' })}
      >
        Register
      </button>
      
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      
      <div data-testid="auth-status">
        {isAuthenticated() ? 'Authenticated' : 'Not authenticated'}
      </div>
    </div>
  );
};

describe('Auth Context', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should provide initial auth state', () => {
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });
  
  it('should handle successful login', async () => {
    // Arrange
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.login.mockResolvedValueOnce({ user: mockUser });
    
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Assert loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert authenticated state
    expect(screen.getByTestId('user-info')).toHaveTextContent('Welcome, test@example.com');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  it('should handle login error', async () => {
    // Arrange
    const mockError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValueOnce(mockError);
    
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
  });
  
  it('should handle successful registration', async () => {
    // Arrange
    const mockResponse = { id: '2', email: 'new@example.com' };
    mockAuthService.register.mockResolvedValueOnce(mockResponse);
    
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click register button
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Assert loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123'
    });
  });
  
  it('should handle registration error', async () => {
    // Arrange
    const mockError = new Error('Email already in use');
    mockAuthService.register.mockRejectedValueOnce(mockError);
    
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click register button
    fireEvent.click(screen.getByTestId('register-button'));
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Assert error state
    expect(screen.getByTestId('error')).toHaveTextContent('Email already in use');
  });
  
  it('should handle logout', async () => {
    // Arrange - first login
    const mockUser = { id: '1', email: 'test@example.com' };
    mockAuthService.login.mockResolvedValueOnce({ user: mockUser });
    
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Logout
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Assert
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });
});
