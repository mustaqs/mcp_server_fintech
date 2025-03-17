export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  last_login_at?: string;
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
}

export interface UserRole {
  name: string;
  permissions: string[];
}
