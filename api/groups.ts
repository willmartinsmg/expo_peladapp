import { apiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/config/api';
import type { Group } from '@/types/group';

/**
 * Groups/Organizations API service
 */
export const groupsApi = {
  /**
   * Get all groups/organizations for current user
   * Uses apiClient - token is added automatically
   */
  async getUserGroups(): Promise<Group[]> {
    const response = await apiClient.get(apiEndpoints.organization.list).json<any[]>();

    // Map backend response to Group interface
    return response.map(org => ({
      id: org.id,
      name: org.name,
      description: org.description,
      isAdmin: org.admin ?? false,
      createdAt: org.createdAt,
      memberCount: org.memberCount,
    }));
  },

  /**
   * Get specific group/organization details
   */
  async getGroup(groupId: number): Promise<Group> {
    const response = await apiClient
      .get(`${apiEndpoints.organization.detail}/${groupId}`)
      .json<any>();

    return {
      id: response.id,
      name: response.name,
      description: response.description,
      isAdmin: response.admin ?? false,
      createdAt: response.createdAt,
      memberCount: response.memberCount,
    };
  },
};
