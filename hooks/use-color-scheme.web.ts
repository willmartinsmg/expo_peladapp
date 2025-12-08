import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import type { ColorScheme } from '@/types/theme';

const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';

/**
 * Web-specific implementation of useColorScheme.
 * Persists user preference to localStorage and syncs with system preference.
 * This allows for manual theme switching on web while respecting system settings.
 */
export function useColorScheme(): ColorScheme {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return (systemColorScheme as ColorScheme) ?? 'light';
  });

  useEffect(() => {
    // Listen for system color scheme changes
    if (systemColorScheme) {
      const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
      // Only update if user hasn't manually set a preference
      if (!stored) {
        setColorScheme(systemColorScheme as ColorScheme);
      }
    }
  }, [systemColorScheme]);

  return colorScheme;
}

/**
 * Helper function to manually set the color scheme on web.
 * Call this from a theme toggle button/switch.
 */
export function setColorScheme(scheme: ColorScheme) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    window.dispatchEvent(new Event('storage'));
  }
}
