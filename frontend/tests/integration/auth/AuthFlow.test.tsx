import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/app/auth/login/page';
import RegisterPage from '@/app/auth/register/page';
import DashboardPage from '@/app/dashboard/page';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock server to intercept API requests
const server = setupServer(
  // Login endpoint
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            is_admin: false,
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Invalid credentials' })
    );
  }),
  
  // Register endpoint
  rest.post('/api/auth/register', (req, res, ctx) => {
    const { email } = req.body as any;
    
    if (email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({ detail: 'Email already registered' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '456',
          email: email,
          username: (req.body as any).username,
          is_admin: false,
        },
      })
    );
  }),
  
  // Current user endpoint
  rest.get('/api/users/me', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-access-token') {
      return res(
        ctx.status(200),
        ctx.json({
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          is_admin: false,
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Not authenticated' })
    );
  })
);

// Setup and teardown the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock the next/navigation functions
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Authentication Flow Integration Tests', () => {
  test('Login flow - successful login redirects to dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Verify we're on the login page
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    
    // Fill in the login form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for redirect to dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });
  
  test('Login flow - invalid credentials shows error message', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Fill in the login form with incorrect password
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Verify we're still on the login page
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
  
  test('Registration flow - successful registration redirects to dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/register']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Verify we're on the register page
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    
    // Fill in the registration form
    await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByLabelText(/username/i), 'newuser');
    await userEvent.type(screen.getByLabelText(/first name/i), 'New');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Wait for redirect to dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });
  
  test('Registration flow - existing email shows error message', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/register']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Fill in the registration form with an existing email
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/username/i), 'existinguser');
    await userEvent.type(screen.getByLabelText(/first name/i), 'Existing');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
    
    // Verify we're still on the register page
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
  });
  
  test('Protected route - redirects to login when not authenticated', async () => {
    // Clear any stored tokens
    localStorage.clear();
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for redirect to login page
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });
  
  test('Protected route - allows access when authenticated', async () => {
    // Set up authentication state
    localStorage.setItem('access_token', 'mock-access-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for dashboard to be displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });
});
