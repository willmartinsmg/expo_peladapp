import { apiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/config/api';

/**
 * User profile data
 */
export interface UserProfile {
  id: number;
  cpf: number;
  name: string;
  email: string;
}

/**
 * User profile update payload
 */
export interface UpdateProfileData {
  name?: string;
  email?: string;
}

/**
 * Users API service
 * Example module showing how to create domain-specific API endpoints
 */
export const usersApi = {
  /**
   * Get current user profile
   * Token is added automatically by apiClient interceptor
   */
  async getProfile(): Promise<UserProfile> {
    return await apiClient
      .get(apiEndpoints.users.profile)
      .json<UserProfile>();
  },

  /**
   * Update user profile
   * Token is added automatically by apiClient interceptor
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return await apiClient
      .put(apiEndpoints.users.update, { json: data })
      .json<UserProfile>();
  },
};
