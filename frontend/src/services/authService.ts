import axios from 'axios';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse, 
  TrustedDevice, 
  SuspiciousLoginInfo,
  DeviceVerificationResponse,
  LoginAttemptInfo
} from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 30000, // 30 seconds
});

// Add request interceptor to add auth token and device token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add device token if available for trusted device authentication
    const deviceToken = localStorage.getItem('device_token');
    if (deviceToken) {
      config.headers['X-Device-Token'] = deviceToken;
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

export const loginUser = async (email: string, password: string, deviceInfo?: any) => {
  try {
    // Include device information if available for suspicious login detection
    const payload = {
      username: email, // The backend expects 'username' for email
      password,
      device_info: deviceInfo || {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    const response = await api.post('/api/auth/token', payload);
    
    // If login is suspicious, the backend will return a flag
    if (response.data.suspicious_login) {
      // Store partial auth state for verification
      localStorage.setItem('partial_auth', JSON.stringify({
        email,
        mfa_token: response.data.mfa_token,
        suspicious_login: true,
        timestamp: Date.now()
      }));
    }
    
    return response.data;
  } catch (error: any) {
    // Handle account lockout specifically
    if (error.response?.status === 423) {
      const lockoutInfo = error.response.data as LoginAttemptInfo;
      throw new Error(
        `Account temporarily locked. Please try again after ${new Date(lockoutInfo.account_locked_until || '').toLocaleString()}.`
      );
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      throw new Error(
        'Too many login attempts. Please try again later.'
      );
    }
    
    throw new Error(
      error.response?.data?.detail || 'Failed to login. Please check your credentials.'
    );
  }
};

export const registerUser = async (userData: RegisterRequest) => {
  try {
    // First try to use the public registration endpoint
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (apiError: any) {
      // If the backend is not available or returns an error, log it
      console.error('API error during registration:', apiError);
      
      // For development/testing, if the backend is not available, use a mock response
      // In production, this should be removed and the error should be propagated
      if (!apiError.response || apiError.code === 'ECONNREFUSED') {
        console.warn('Backend not available, using mock response for development');
        // Return a mock successful response for development purposes
        return {
          id: 'mock-user-id',
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      // If it's a real API error (not just connectivity), propagate it
      throw apiError;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Log more detailed information for debugging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
    // Handle specific error cases based on status codes
    if (error.response?.status === 409) {
      throw new Error('User with this email or username already exists');
    } else if (error.response?.status === 400) {
      // Handle validation errors
      if (error.response.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response.data?.errors) {
        // Format validation errors
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        throw new Error(`Validation error: ${errorMessages}`);
      } else if (typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      } else {
        throw new Error('Invalid form data. Please check your inputs and try again.');
      }
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      // Network errors or other issues with a message
      throw new Error(`Registration failed: ${error.message}`);
    } else {
      // Fallback error message
      throw new Error('Failed to register. Please try again.');
    }
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

/**
 * Request a password reset email
 * @param email - User's email address
 * @returns Success message
 */
export const resetPassword = async (email: string) => {
  try {
    const response = await api.post('/api/auth/password-reset/request', { email });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to send password reset email. Please try again.'
    );
  }
};

/**
 * Confirm password reset with token and new password
 * @param token - Password reset token from email
 * @param password - New password
 * @returns Success message
 */
export const resetPasswordConfirm = async (token: string, password: string) => {
  try {
    const response = await api.post('/api/auth/password-reset/confirm', { 
      token, 
      new_password: password 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to reset password. Please try again.'
    );
  }
};

/**
 * Initialize MFA setup for a user
 * @param method - MFA method to set up (email, sms, totp)
 * @returns Setup information including a temporary secret
 */
export const setupMFA = async (method: string = 'email') => {
  try {
    const response = await api.post('/api/auth/mfa/setup', { method });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to set up MFA. Please try again.'
    );
  }
};

/**
 * Verify MFA setup with initial code
 * @param code - Verification code received via email
 * @returns Success status and recovery codes
 */
export const verifyMFASetup = async (code: string) => {
  try {
    const response = await api.post('/api/auth/mfa/verify-setup', { code });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to verify MFA setup. Please try again.'
    );
  }
};

/**
 * Disable MFA for a user
 * @param password - User's current password for verification
 * @returns Success status
 */
export const disableMFA = async (password: string) => {
  try {
    const response = await api.post('/api/auth/mfa/disable', { password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to disable MFA. Please try again.'
    );
  }
};

/**
 * Verify MFA code during login
 * @param email - User's email address
 * @param code - Verification code received via email
 * @returns Authentication tokens
 */
export const verifyMFACode = async (email: string, code: string, trustDevice: boolean = false) => {
  try {
    const payload = { 
      email, 
      code,
      trust_device: trustDevice,
      device_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    const response = await api.post('/api/auth/mfa/verify', payload);
    
    // If user chose to trust this device, store the device token
    if (trustDevice && response.data.device_token) {
      localStorage.setItem('device_token', response.data.device_token);
    }
    
    // Clear any partial authentication state
    localStorage.removeItem('partial_auth');
    
    return response.data;
  } catch (error: any) {
    // Handle rate limiting for MFA attempts
    if (error.response?.status === 429) {
      throw new Error(
        'Too many verification attempts. Please try again later.'
      );
    }
    
    throw new Error(
      error.response?.data?.detail || 'Invalid verification code. Please try again.'
    );
  }
};

/**
 * Generate new recovery codes
 * @param password - User's current password for verification
 * @returns New recovery codes
 */
export const generateRecoveryCodes = async (password: string) => {
  try {
    const response = await api.post('/api/auth/mfa/recovery-codes', { password });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to generate recovery codes. Please try again.'
    );
  }
};

/**
 * Get a list of trusted devices for the current user
 * @returns List of trusted devices
 */
export const getTrustedDevices = async (): Promise<TrustedDevice[]> => {
  try {
    const response = await api.get('/api/auth/devices/trusted');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to retrieve trusted devices.'
    );
  }
};

/**
 * Remove a trusted device
 * @param deviceId - ID of the device to remove
 * @returns Success status
 */
export const removeTrustedDevice = async (deviceId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/api/auth/devices/trusted/${deviceId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to remove trusted device.'
    );
  }
};

/**
 * Verify a suspicious login
 * @param email - User's email
 * @param verificationCode - Code sent to verify the suspicious login
 * @param trustDevice - Whether to trust this device for future logins
 * @returns Authentication tokens
 */
export const verifySuspiciousLogin = async (
  email: string,
  verificationCode: string,
  trustDevice: boolean = false
): Promise<TokenResponse> => {
  try {
    const payload = {
      email,
      code: verificationCode,
      trust_device: trustDevice,
      device_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    const response = await api.post('/api/auth/verify-suspicious-login', payload);
    
    // If user chose to trust this device, store the device token
    if (trustDevice && response.data.device_token) {
      localStorage.setItem('device_token', response.data.device_token);
    }
    
    // Clear any partial authentication state
    localStorage.removeItem('partial_auth');
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to verify login. Please try again.'
    );
  }
};

/**
 * Get recent login attempts for the current user
 * @returns List of recent login attempts
 */
export const getLoginAttempts = async (): Promise<SuspiciousLoginInfo[]> => {
  try {
    const response = await api.get('/api/auth/login-attempts');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to retrieve login attempts.'
    );
  }
};

// Setup TOTP (Time-based One-Time Password) for authenticator apps
// @returns TOTP setup information including QR code URL and secret key
export const setupTOTP = async () => {
  try {
    const response = await api.post('/api/auth/mfa/setup/totp');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to setup authenticator app. Please try again.'
    );
  }
};

// Verify TOTP setup with code from authenticator app
// @param code - Verification code from authenticator app
// @param setupToken - Token received during setup
// @returns Success status
export const verifyTOTPSetup = async (code: string, setupToken: string) => {
  try {
    const response = await api.post('/api/auth/mfa/verify/totp', { 
      code,
      setup_token: setupToken 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to verify authenticator app. Please try again.'
    );
  }
};

// Setup SMS-based MFA
// @param phoneNumber - Phone number to receive SMS verification codes
// @returns SMS setup information
export const setupSMS = async (phoneNumber: string) => {
  try {
    const response = await api.post('/api/auth/mfa/setup/sms', { phone_number: phoneNumber });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to setup SMS verification. Please try again.'
    );
  }
};

// Verify SMS setup with code received via SMS
// @param code - Verification code received via SMS
// @param setupToken - Token received during setup
// @returns Success status
export const verifySMSSetup = async (code: string, setupToken: string) => {
  try {
    const response = await api.post('/api/auth/mfa/verify/sms', { 
      code,
      setup_token: setupToken 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to verify SMS code. Please try again.'
    );
  }
};

// Get user's MFA preferences and enabled methods
// @returns MFA preferences including enabled methods
export const getMFAPreferences = async () => {
  try {
    const response = await api.get('/api/auth/mfa/preferences');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to get MFA preferences. Please try again.'
    );
  }
};

// Update user's preferred MFA method
// @param method - Preferred MFA method (email, sms, totp)
// @returns Updated MFA preferences
export const updatePreferredMFAMethod = async (method: string) => {
  try {
    const response = await api.put('/api/auth/mfa/preferences', { preferred_method: method });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to update preferred MFA method. Please try again.'
    );
  }
};

/**
 * Use recovery code for login
 * @param email - User's email address
 * @param recoveryCode - Recovery code
 * @returns Authentication tokens
 */
export const useRecoveryCode = async (email: string, recoveryCode: string) => {
  try {
    const response = await api.post('/api/auth/mfa/verify-recovery', { email, recovery_code: recoveryCode });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Invalid recovery code. Please try again.'
    );
  }
};
