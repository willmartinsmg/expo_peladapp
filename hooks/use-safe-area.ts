import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook that provides safe area insets for proper layout.
 * Use this to avoid content being obscured by notches, status bars, etc.
 *
 * @returns Object with top, bottom, left, right insets
 *
 * @example
 * const { top, bottom } = useSafeArea();
 * <View style={{ paddingTop: top, paddingBottom: bottom }}>
 *   <Text>Content</Text>
 * </View>
 */
export function useSafeArea() {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    insets,
  };
}
