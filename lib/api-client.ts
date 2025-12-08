import ky from 'ky';
import { apiConfig } from '@/config/api';
import { storage } from './storage';

/**
 * Public API client (no authentication required)
 * Used for login and public endpoints
 */
export const publicApiClient = ky.create({
  prefixUrl: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

/**
 * Authenticated API client
 * Automatically adds auth token to requests
 */
export const apiClient = ky.create({
  prefixUrl: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await storage.get(storage.keys.AUTH_TOKEN);
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          await storage.clear();
          // You can emit an event here to redirect to login
          // or use a global state management solution
        }
        return response;
      },
    ],
  },
});
