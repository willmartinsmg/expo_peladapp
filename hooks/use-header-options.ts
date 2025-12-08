import { StyleSheet } from 'react-native';
import { FontSizes } from '@/constants/theme';
import { useThemeColor } from './use-theme-color';
import type { ColorKey } from '@/types/theme';

export function useHeaderOptions(title?: string) {
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');
  const borderColor = useThemeColor('border');

  return {
    headerShown: true,
    title: title || '',
    headerStyle: {
      backgroundColor,
      borderBottomColor: borderColor,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTintColor: textColor,
    headerTitleStyle: {
      color: textColor,
      fontWeight: '600' as const,
      fontSize: FontSizes.md,
    },
    headerShadowVisible: false,
    headerBackTitle: '',
  };
}
