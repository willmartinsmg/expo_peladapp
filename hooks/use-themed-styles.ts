import { useMemo } from 'react';
import type { ColorScheme } from '@/types/theme';
import { useColorScheme } from './use-color-scheme';

/**
 * Hook that creates theme-aware styles using a factory function.
 * The factory function receives the current color scheme and returns StyleSheet styles.
 * Results are memoized for performance.
 *
 * @param createStyles - Factory function that takes a ColorScheme and returns styles
 * @returns The created styles object
 *
 * @example
 * // In component:
 * const styles = useThemedStyles(createStyles);
 *
 * // In .styles.ts file:
 * export const createStyles = (scheme: ColorScheme) => StyleSheet.create({
 *   container: {
 *     backgroundColor: Colors[scheme].background,
 *   },
 * });
 */
export function useThemedStyles<T>(
  createStyles: (scheme: ColorScheme) => T
): T {
  const scheme = useColorScheme();

  return useMemo(() => createStyles(scheme), [scheme, createStyles]);
}
