import { Spacing } from '@/constants/theme';
import type { SpacingKey } from '@/types/theme';

/**
 * Hook that provides access to theme spacing values.
 * Returns both the Spacing object and a helper function.
 *
 * @returns Object with spacing values and helper function
 *
 * @example
 * const { spacing, spacingValue } = useSpacing();
 *
 * // Get single value
 * const margin = spacingValue('md'); // 16
 *
 * // Get multiple values as array
 * const [paddingX, paddingY] = spacing('lg', 'md'); // [24, 16]
 *
 * // Use directly
 * <View style={{ padding: spacing.md }} />
 */
export function useSpacing() {
  /**
   * Helper function to get one or more spacing values.
   * Returns an array if multiple keys provided, single value if one key.
   */
  const spacingValue = (...keys: SpacingKey[]): number | number[] => {
    if (keys.length === 1) {
      return Spacing[keys[0]];
    }
    return keys.map(key => Spacing[key]);
  };

  return {
    spacing: Spacing,
    spacingValue,
  };
}
