import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage service using expo-secure-store for secure token storage
 * Falls back to AsyncStorage on web platform
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ACTIVE_GROUP_ID: 'active_group_id',
  GROUPS_CACHE: 'groups_cache',
} as const;

/**
 * Save a value to secure storage
 */
async function save(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    // On web, use localStorage as fallback
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Get a value from secure storage
 */
async function get(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

/**
 * Delete a value from secure storage
 */
async function remove(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

/**
 * Clear all stored values
 */
async function clear(): Promise<void> {
  await remove(STORAGE_KEYS.AUTH_TOKEN);
  await remove(STORAGE_KEYS.USER_DATA);
  await remove(STORAGE_KEYS.ACTIVE_GROUP_ID);
  await remove(STORAGE_KEYS.GROUPS_CACHE);
}

export const storage = {
  save,
  get,
  remove,
  clear,
  keys: STORAGE_KEYS,
};
