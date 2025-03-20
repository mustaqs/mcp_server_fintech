'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  RegisterRequest, 
  MFASetupResponse, 
  MFAVerifySetupResponse, 
  MFARecoveryCodesResponse, 
  TOTPSetupResponse, 
  SMSSetupResponse, 
  MFAPreferenceResponse, 
  MFAMethod,
  TrustedDevice,
  SuspiciousLoginInfo,
  LoginAttemptInfo
} from '../types/user';
import { 
  loginUser, 
  registerUser, 
  refreshToken, 
  logoutUser, 
  getCurrentUser, 
  resetPassword as resetPasswordService, 
  resetPasswordConfirm as resetPasswordConfirmService,
  setupMFA as setupMFAService,
  verifyMFASetup as verifyMFASetupService,
  disableMFA as disableMFAService,
  verifyMFACode as verifyMFACodeService,
  generateRecoveryCodes as generateRecoveryCodesService,
  useRecoveryCode as useRecoveryCodeService,
  setupTOTP as setupTOTPService,
  verifyTOTPSetup as verifyTOTPSetupService,
  setupSMS as setupSMSService,
  verifySMSSetup as verifySMSSetupService,
  getMFAPreferences as getMFAPreferencesService,
  updatePreferredMFAMethod as updatePreferredMFAMethodService,
  getTrustedDevices as getTrustedDevicesService,
  removeTrustedDevice as removeTrustedDeviceService,
  verifySuspiciousLogin as verifySuspiciousLoginService,
  getLoginAttempts as getLoginAttemptsService
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMFARequired: boolean;
  mfaEmail: string | null;
  mfaToken: string | null;
  isSuspiciousLogin: boolean;
  suspiciousLoginInfo: SuspiciousLoginInfo | null;
  login: (email: string, password: string, deviceInfo?: any) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  resetPasswordConfirm: (token: string, password: string) => Promise<void>;
  setupMFA: (method?: string) => Promise<MFASetupResponse>;
  verifyMFASetup: (code: string) => Promise<MFAVerifySetupResponse>;
  disableMFA: (password: string) => Promise<void>;
  verifyMFACode: (code: string, trustDevice?: boolean) => Promise<void>;
  generateRecoveryCodes: (password: string) => Promise<MFARecoveryCodesResponse>;
  useRecoveryCode: (recoveryCode: string) => Promise<void>;
  setupTOTP: () => Promise<TOTPSetupResponse>;
  verifyTOTPSetup: (code: string, setupToken: string) => Promise<MFAVerifySetupResponse>;
  setupSMS: (phoneNumber: string) => Promise<SMSSetupResponse>;
  verifySMSSetup: (code: string, setupToken: string) => Promise<MFAVerifySetupResponse>;
  getMFAPreferences: () => Promise<MFAPreferenceResponse>;
  updatePreferredMFAMethod: (method: string) => Promise<MFAPreferenceResponse>;
  getTrustedDevices: () => Promise<TrustedDevice[]>;
  removeTrustedDevice: (deviceId: string) => Promise<void>;
  verifySuspiciousLogin: (code: string, trustDevice?: boolean) => Promise<void>;
  getLoginAttempts: () => Promise<SuspiciousLoginInfo[]>;
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
  const [isMFARequired, setIsMFARequired] = useState<boolean>(false);
  const [mfaEmail, setMfaEmail] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [isSuspiciousLogin, setIsSuspiciousLogin] = useState<boolean>(false);
  const [suspiciousLoginInfo, setSuspiciousLoginInfo] = useState<SuspiciousLoginInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        // Check for stored MFA state
        const storedMFAState = localStorage.getItem('mfa_required');
        if (storedMFAState) {
          try {
            const { email, token } = JSON.parse(storedMFAState);
            setIsMFARequired(true);
            setMfaEmail(email);
            setMfaToken(token);
            setIsLoading(false);
            return;
          } catch (e) {
            // Invalid JSON, remove item
            localStorage.removeItem('mfa_required');
          }
        }
        
        // Check for suspicious login state
        const suspiciousLoginState = localStorage.getItem('partial_auth');
        if (suspiciousLoginState) {
          try {
            const parsedState = JSON.parse(suspiciousLoginState);
            // Check if the partial auth state is still valid (less than 10 minutes old)
            const isValid = parsedState.timestamp && 
                           (Date.now() - parsedState.timestamp < 10 * 60 * 1000);
            
            if (isValid && parsedState.suspicious_login) {
              setIsSuspiciousLogin(true);
              setSuspiciousLoginInfo(parsedState.login_info || null);
              setMfaEmail(parsedState.email);
              setMfaToken(parsedState.token);
              setIsLoading(false);
              return;
            } else {
              // Clear expired partial auth state
              localStorage.removeItem('partial_auth');
            }
          } catch (e) {
            // Invalid JSON, remove item
            localStorage.removeItem('partial_auth');
          }
        }

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
          localStorage.removeItem('mfa_required');
          localStorage.removeItem('partial_auth');
          localStorage.removeItem('device_token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, deviceInfo?: any) => {
    setIsLoading(true);
    setError(null);
    setIsMFARequired(false);
    setMfaEmail(null);
    setMfaToken(null);
    setIsSuspiciousLogin(false);
    setSuspiciousLoginInfo(null);
    
    try {
      const response = await loginUser(email, password, deviceInfo);
      
      // Handle suspicious login detection
      if (response.suspicious_login) {
        // Store suspicious login state with timestamp
        localStorage.setItem('partial_auth', JSON.stringify({
          email,
          token: response.mfa_token,
          suspicious_login: true,
          login_info: response.login_info,
          timestamp: Date.now()
        }));
        
        setIsSuspiciousLogin(true);
        setSuspiciousLoginInfo(response.login_info);
        setMfaEmail(email);
        setMfaToken(response.mfa_token);
        
        // Redirect to suspicious login verification page
        router.push(`/auth/verify-login?email=${encodeURIComponent(email)}`);
        return;
      }
      
      // Check if MFA is required
      if (response.mfa_required) {
        // Store MFA state
        localStorage.setItem('mfa_required', JSON.stringify({
          email,
          token: response.mfa_token
        }));
        
        setIsMFARequired(true);
        setMfaEmail(email);
        setMfaToken(response.mfa_token);
        
        // Redirect to MFA verification page
        router.push(`/auth/two-factor?email=${encodeURIComponent(email)}`);
        return;
      }
      
      // No MFA required, proceed with normal login
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store device token if provided
      if (response.device_token) {
        localStorage.setItem('device_token', response.device_token);
      }
      
      // Get user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // Check for account lockout
      if (err.message && err.message.includes('Account temporarily locked')) {
        setError(err.message);
      } else if (err.message && err.message.includes('Too many failed attempts')) {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to login');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Register the user but don't auto-login
      await registerUser(userData);
      
      // Registration successful - redirect to login page with success message
      router.push('/auth/login?registered=true');
      return;
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      console.error('Registration error:', err);
      throw err; // Propagate error to the component
    } finally {
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
      localStorage.removeItem('mfa_required');
      localStorage.removeItem('partial_auth');
      localStorage.removeItem('device_token');
      
      // Clear user state
      setUser(null);
      setIsMFARequired(false);
      setMfaEmail(null);
      setMfaToken(null);
      setIsSuspiciousLogin(false);
      setSuspiciousLoginInfo(null);
      
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

  // MFA Functions
  const setupMFA = async (method: string = 'email'): Promise<MFASetupResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await setupMFAService(method);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to set up MFA');
      console.error('MFA setup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFASetup = async (code: string): Promise<MFAVerifySetupResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await verifyMFASetupService(code);
      
      // Update user data after successful MFA setup
      if (response.success && user) {
        setUser({
          ...user,
          mfa_enabled: true,
          mfa_verified: true,
          mfa_methods: ['email']
        });
      }
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA setup');
      console.error('MFA verification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async (password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await disableMFAService(password);
      
      // Update user data after disabling MFA
      if (user) {
        setUser({
          ...user,
          mfa_enabled: false,
          mfa_verified: false
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
      console.error('Disable MFA error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFACode = async (code: string, trustDevice: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!mfaEmail) {
        throw new Error('No email found for MFA verification');
      }
      
      const response = await verifyMFACodeService(mfaEmail, code, trustDevice);
      
      // Store tokens and reset MFA state
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store device token if user chose to trust this device
      if (trustDevice && response.device_token) {
        localStorage.setItem('device_token', response.device_token);
      }
      
      // Clear MFA state
      localStorage.removeItem('mfa_required');
      setIsMFARequired(false);
      setMfaEmail(null);
      setMfaToken(null);
      
      // Get user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // Check for rate limiting
      if (err.message && err.message.includes('Too many verification attempts')) {
        setError('Too many verification attempts. Please try again later.');
      } else {
        setError(err.message || 'Invalid verification code');
      }
      console.error('MFA verification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecoveryCodes = async (password: string): Promise<MFARecoveryCodesResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateRecoveryCodesService(password);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to generate recovery codes');
      console.error('Recovery codes generation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const useRecoveryCode = async (recoveryCode: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!mfaEmail) {
        throw new Error('No email found for recovery code verification');
      }
      
      const response = await useRecoveryCodeService(mfaEmail, recoveryCode);
      
      // Store tokens and reset MFA state
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      setIsMFARequired(false);
      setMfaEmail(null);
      setMfaToken(null);
      
      // Get user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid recovery code');
      console.error('Recovery code verification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Implement trusted devices management functions
  const getTrustedDevices = async (): Promise<TrustedDevice[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const devices = await getTrustedDevicesService();
      return devices;
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve trusted devices');
      console.error('Get trusted devices error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTrustedDevice = async (deviceId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await removeTrustedDeviceService(deviceId);
    } catch (err: any) {
      setError(err.message || 'Failed to remove trusted device');
      console.error('Remove trusted device error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Implement suspicious login verification
  const verifySuspiciousLogin = async (code: string, trustDevice: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!mfaEmail) {
        throw new Error('No email found for suspicious login verification');
      }
      
      const response = await verifySuspiciousLoginService(mfaEmail, code, trustDevice);
      
      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store device token if user chose to trust this device
      if (trustDevice && response.device_token) {
        localStorage.setItem('device_token', response.device_token);
      }
      
      // Clear suspicious login state
      localStorage.removeItem('partial_auth');
      setIsSuspiciousLogin(false);
      setSuspiciousLoginInfo(null);
      setMfaEmail(null);
      setMfaToken(null);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to verify suspicious login');
      console.error('Suspicious login verification error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Implement login attempts retrieval
  const getLoginAttempts = async (): Promise<SuspiciousLoginInfo[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loginAttempts = await getLoginAttemptsService();
      return loginAttempts;
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve login attempts');
      console.error('Get login attempts error:', err);
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
        isMFARequired,
        mfaEmail,
        mfaToken,
        isSuspiciousLogin,
        suspiciousLoginInfo,
        login,
        register,
        logout,
        resetPassword,
        resetPasswordConfirm,
        setupMFA,
        verifyMFASetup,
        disableMFA,
        verifyMFACode,
        generateRecoveryCodes,
        useRecoveryCode,
        getTrustedDevices,
        removeTrustedDevice,
        verifySuspiciousLogin,
        getLoginAttempts,
        error,
        setupTOTP: async () => {
          try {
            setIsLoading(true);
            const response = await setupTOTPService();
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to setup authenticator app');
            console.error('TOTP setup error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        verifyTOTPSetup: async (code: string, setupToken: string) => {
          try {
            setIsLoading(true);
            const response = await verifyTOTPSetupService(code, setupToken);
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to verify authenticator app');
            console.error('TOTP verification error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        setupSMS: async (phoneNumber: string) => {
          try {
            setIsLoading(true);
            const response = await setupSMSService(phoneNumber);
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to setup SMS verification');
            console.error('SMS setup error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        verifySMSSetup: async (code: string, setupToken: string) => {
          try {
            setIsLoading(true);
            const response = await verifySMSSetupService(code, setupToken);
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to verify SMS code');
            console.error('SMS verification error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        getMFAPreferences: async () => {
          try {
            setIsLoading(true);
            const response = await getMFAPreferencesService();
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to get MFA preferences');
            console.error('Get MFA preferences error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
        updatePreferredMFAMethod: async (method: string) => {
          try {
            setIsLoading(true);
            const response = await updatePreferredMFAMethodService(method);
            return response;
          } catch (err: any) {
            setError(err.message || 'Failed to update preferred MFA method');
            console.error('Update preferred MFA method error:', err);
            throw err;
          } finally {
            setIsLoading(false);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
