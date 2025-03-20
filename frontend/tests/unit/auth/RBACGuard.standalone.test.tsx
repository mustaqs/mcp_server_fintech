import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';

// Mock auth context
const AuthContext = React.createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
  mockUser?: any;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, mockUser = null }) => {
  const [user] = React.useState<any>(mockUser);
  
  const value = {
    user,
    isAuthenticated: () => !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// RBAC Guard component implementation
interface RBACGuardProps {
  children: ReactNode;
  requiredRole: string;
  fallback?: ReactNode;
}

const RBACGuard: React.FC<RBACGuardProps> = ({ 
  children, 
  requiredRole, 
  fallback = <div data-testid="access-denied">Access Denied</div> 
}) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <div data-testid="not-authenticated">Please log in</div>;
  }
  
  if (user.role === requiredRole || user.role === 'admin') {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

// Test components
const AdminContent = () => <div data-testid="admin-content">Admin Content</div>;
const UserContent = () => <div data-testid="user-content">User Content</div>;

describe('RBAC Guard Component', () => {
  it('should show "Please log in" when user is not authenticated', () => {
    // Act
    render(
      <AuthProvider mockUser={null}>
        <RBACGuard requiredRole="admin">
          <AdminContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('not-authenticated')).toHaveTextContent('Please log in');
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });
  
  it('should show admin content when user has admin role', () => {
    // Arrange
    const adminUser = { id: '1', email: 'admin@example.com', role: 'admin' };
    
    // Act
    render(
      <AuthProvider mockUser={adminUser}>
        <RBACGuard requiredRole="admin">
          <AdminContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.queryByTestId('not-authenticated')).not.toBeInTheDocument();
    expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
  });
  
  it('should show access denied when user does not have required role', () => {
    // Arrange
    const regularUser = { id: '2', email: 'user@example.com', role: 'user' };
    
    // Act
    render(
      <AuthProvider mockUser={regularUser}>
        <RBACGuard requiredRole="admin">
          <AdminContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });
  
  it('should show user content when user has the required role', () => {
    // Arrange
    const regularUser = { id: '2', email: 'user@example.com', role: 'user' };
    
    // Act
    render(
      <AuthProvider mockUser={regularUser}>
        <RBACGuard requiredRole="user">
          <UserContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('user-content')).toBeInTheDocument();
  });
  
  it('should allow admin access to user content (role hierarchy)', () => {
    // Arrange
    const adminUser = { id: '1', email: 'admin@example.com', role: 'admin' };
    
    // Act
    render(
      <AuthProvider mockUser={adminUser}>
        <RBACGuard requiredRole="user">
          <UserContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('user-content')).toBeInTheDocument();
  });
  
  it('should render custom fallback content when provided', () => {
    // Arrange
    const regularUser = { id: '2', email: 'user@example.com', role: 'user' };
    const customFallback = <div data-testid="custom-fallback">Custom Access Denied</div>;
    
    // Act
    render(
      <AuthProvider mockUser={regularUser}>
        <RBACGuard requiredRole="admin" fallback={customFallback}>
          <AdminContent />
        </RBACGuard>
      </AuthProvider>
    );
    
    // Assert
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('access-denied')).not.toBeInTheDocument();
  });
});
