import { apiClient, publicApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/config/api';
import type {
  SignInCredentials,
  SignInResponse,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  User,
} from '@/types/auth';

/**
 * Authentication API service
 */
export const authApi = {
  /**
   * Sign in with CPF and password
   * Uses publicApiClient since user doesn't have a token yet
   */
  async signIn(credentials: SignInCredentials): Promise<SignInResponse> {
    return await publicApiClient
      .post(apiEndpoints.auth.signIn, { json: credentials })
      .json<SignInResponse>();
  },

  /**
   * Send verification code to email
   * Uses publicApiClient since user doesn't have a token yet
   */
  async sendCode(request: SendCodeRequest): Promise<SendCodeResponse> {
    return await publicApiClient
      .post(apiEndpoints.auth.sendCode, { json: request })
      .json<SendCodeResponse>();
  },

  /**
   * Verify code and sign in
   * Uses publicApiClient since user doesn't have a token yet
   */
  async verifyCode(request: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    return await publicApiClient
      .post(apiEndpoints.auth.verifyCode, { json: request })
      .json<VerifyCodeResponse>();
  },

  /**
   * Get Google OAuth login URL
   * Returns the authorization URL to redirect user to Google
   */
  async getGoogleLoginUrl(): Promise<string> {
    const response = await publicApiClient.get(apiEndpoints.auth.googleLogin);
    // If the endpoint redirects, we need to get the URL
    return response.url;
  },

  /**
   * Validate token
   * Uses apiClient - token is added automatically by interceptor
   */
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get(apiEndpoints.auth.validate);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get user profile
   * Uses apiClient - token is added automatically
   */
  async getProfile(): Promise<User> {
    return await apiClient.get(apiEndpoints.auth.profile).json<User>();
  },

  /**
   * Sign out
   * Uses apiClient - token is added automatically
   */
  async signOut(): Promise<void> {
    await apiClient.post(apiEndpoints.auth.signOut);
  },
};
