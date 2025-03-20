import axios from 'axios';

import { User, UpdateUserProfileRequest } from '../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get the current user's profile
 * @returns User profile data
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch user profile'
    );
  }
};

/**
 * Update the current user's profile
 * @param profileData - The profile data to update
 * @returns Updated user profile
 */
export const updateUserProfile = async (profileData: UpdateUserProfileRequest): Promise<User> => {
  try {
    const response = await api.put('/api/users/me', profileData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to update user profile'
    );
  }
};

/**
 * Upload a profile picture
 * @param file - The image file to upload
 * @returns Updated user profile with new image URL
 */
export const uploadProfilePicture = async (file: File): Promise<{ profile_image_url: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to upload profile picture'
    );
  }
};

/**
 * Change user password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post('/api/users/me/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to change password'
    );
  }
};

/**
 * Update the current user's notification preferences
 * @param preferences - Notification preferences to update
 * @returns Updated user with new notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: import('../types/user').NotificationPreferences
): Promise<import('../types/user').User> => {
  try {
    const response = await api.put('/api/users/me/notification-preferences', { preferences });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to update notification preferences'
    );
  }
};

/**
 * Promote or demote a user to admin status (admin only)
 * @param userId - The ID of the user to promote/demote
 * @param isAdmin - Whether to promote (true) or demote (false) the user
 * @returns Updated user with new admin status
 */
export const promoteUser = async (userId: string, isAdmin: boolean): Promise<import('../types/user').User> => {
  try {
    const response = await api.post(`/api/users/${userId}/promote`, { is_admin: isAdmin });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || `Failed to ${isAdmin ? 'promote' : 'demote'} user`
    );
  }
};

/**
 * Get all users (admin only)
 * @returns List of all users
 */
export const getUsers = async (): Promise<import('../types/user').User[]> => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || 'Failed to fetch users'
    );
  }
};
