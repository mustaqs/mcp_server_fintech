export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_image_url?: string;
  notification_preferences?: NotificationPreferences;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  mfa_enabled: boolean;
  mfa_verified: boolean;
  mfa_methods?: string[];
  failed_login_attempts?: number;
  account_locked_until?: string;
  trusted_devices?: TrustedDevice[];
}

export interface LoginRequest {
  username: string; // Email or username
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  mfa_required?: boolean;
  mfa_token?: string;
  suspicious_login?: boolean;
  device_trusted?: boolean;
  device_token?: string;
}

export interface UserRole {
  name: string;
  permissions: string[];
}

export interface UpdateUserProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface MFASetupResponse {
  success: boolean;
  email: string;
  setup_token: string;
  method?: MFAMethod;
}

export interface MFAVerifySetupResponse {
  success: boolean;
  recovery_codes: string[];
}

export interface MFAVerifyResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MFARecoveryCodesResponse {
  recovery_codes: string[];
}

export type MFAMethod = 'email' | 'sms' | 'totp';

export interface TOTPSetupResponse {
  success: boolean;
  secret_key: string;
  qr_code_url: string;
  setup_token: string;
}

export interface SMSSetupResponse {
  success: boolean;
  phone_number: string;
  setup_token: string;
}

export interface MFAMethodStatus {
  method: MFAMethod;
  enabled: boolean;
  is_primary: boolean;
  last_used?: string;
}

export interface MFAPreferenceResponse {
  mfa_enabled: boolean;
  methods: MFAMethodStatus[];
  preferred_method?: MFAMethod;
}

export interface TrustedDevice {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  operating_system: string;
  ip_address: string;
  last_used: string;
  is_current: boolean;
}

export interface SuspiciousLoginInfo {
  ip_address: string;
  location: string;
  device: string;
  browser: string;
  timestamp: string;
  is_suspicious: boolean;
  reason: string;
}

export interface DeviceVerificationResponse {
  device_verified: boolean;
  device_token: string;
}

export interface LoginAttemptInfo {
  remaining_attempts: number;
  lockout_duration_minutes?: number;
  account_locked_until?: string;
}
