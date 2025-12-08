export type ColorScheme = 'light' | 'dark';

export type SpacingKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type BorderRadiusKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type FontSizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'title' | 'heading';
export type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';
export type ShadowKey = 'sm' | 'md' | 'lg';

export interface ThemeColors {
  // UI Colors
  text: string;
  textSecondary: string;
  background: string;
  backgroundSecondary: string;
  border: string;
  icon: string;
  tint: string;

  // Tab Colors
  tabIconDefault: string;
  tabIconSelected: string;

  // Semantic Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  success: string;
  successLight: string;
  successDark: string;

  error: string;
  errorLight: string;
  errorDark: string;

  warning: string;
  warningLight: string;
  warningDark: string;

  info: string;
  infoLight: string;
  infoDark: string;
}

export type ColorKey = keyof ThemeColors;
