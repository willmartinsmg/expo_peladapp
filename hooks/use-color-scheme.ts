import { useColorScheme as useRNColorScheme } from 'react-native';
import type { ColorScheme } from '@/types/theme';

/**
 * Returns the current color scheme (light or dark) from the device's system settings.
 * On native platforms, this automatically responds to system theme changes.
 */
export function useColorScheme(): ColorScheme {
  const colorScheme = useRNColorScheme();
  return (colorScheme as ColorScheme) ?? 'light';
}
