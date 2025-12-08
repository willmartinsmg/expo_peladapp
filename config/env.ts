import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Type-safe environment variable access
 *
 * Variables prefixed with EXPO_PUBLIC_ are exposed to the client
 * and accessible via expo-constants
 */

// Get base API URL from environment
const getApiUrl = () => {
  const envApiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ?? 'http://localhost:3004';

  // On Android emulator, localhost needs to be replaced with 10.0.2.2
  if (Platform.OS === 'android' && envApiUrl.includes('localhost')) {
    return envApiUrl.replace('localhost', '10.0.2.2');
  }

  return envApiUrl;
};

export const env = {
  API_URL: getApiUrl(),
  API_TIMEOUT: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_TIMEOUT ?? 10000,
  ENV: Constants.expoConfig?.extra?.EXPO_PUBLIC_ENV ?? 'development',
  IS_DEV: __DEV__,
} as const;
