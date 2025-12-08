import { Colors } from '@/constants/theme';
import type { ColorKey } from '@/types/theme';
import { useColorScheme } from './use-color-scheme';

/**
 * Returns a color value from the theme based on the current color scheme.
 *
 * @param colorName - The name of the color from the theme (e.g., 'primary', 'background', 'text')
 * @param lightColor - Optional override for light mode
 * @param darkColor - Optional override for dark mode
 *
 * @example
 * const backgroundColor = useThemeColor('background');
 * const customColor = useThemeColor('primary', '#custom-light', '#custom-dark');
 */
export function useThemeColor(
  colorName: ColorKey,
  lightColor?: string,
  darkColor?: string
): string {
  const scheme = useColorScheme();

  // Use override colors if provided
  if (lightColor && darkColor) {
    return scheme === 'light' ? lightColor : darkColor;
  }

  // Fall back to theme colors
  return Colors[scheme][colorName];
}
