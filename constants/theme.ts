import type {
  BorderRadiusKey,
  FontSizeKey,
  FontWeightKey,
  ShadowKey,
  SpacingKey,
  ThemeColors,
} from "@/types/theme";
import { Platform } from "react-native";

// ============================================================================
// COLORS
// ============================================================================

export const Colors: Record<"light" | "dark", ThemeColors> = {
  light: {
    // UI Colors
    text: "#11181C",
    textSecondary: "#687076",
    background: "#FFFFFF",
    backgroundSecondary: "#F3F4F6",
    border: "#E5E7EB",
    icon: "#687076",
    tint: "#0a7ea4",

    // Tab Colors
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",

    // Semantic Colors - Primary (Blue)
    primary: "#0a7ea4",
    primaryLight: "#3b9fc1",
    primaryDark: "#085d7d",

    // Secondary (Gray)
    secondary: "#6B7280",
    secondaryLight: "#9CA3AF",
    secondaryDark: "#4B5563",

    // Success (Green)
    success: "#10B981",
    successLight: "#34D399",
    successDark: "#059669",

    // Error (Red)
    error: "#EF4444",
    errorLight: "#F87171",
    errorDark: "#DC2626",

    // Warning (Yellow/Orange)
    warning: "#F59E0B",
    warningLight: "#FBBF24",
    warningDark: "#D97706",

    // Info (Light Blue)
    info: "#3B82F6",
    infoLight: "#60A5FA",
    infoDark: "#2563EB",
  },
  dark: {
    // UI Colors
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    background: "#151718",
    backgroundSecondary: "#1F2023",
    border: "#2C2D30",
    icon: "#9BA1A6",
    tint: "#FFFFFF",

    // Tab Colors
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",

    // Semantic Colors - Primary (Light Blue)
    primary: "#3b9fc1",
    primaryLight: "#5fb3d1",
    primaryDark: "#2a7a94",

    // Secondary (Light Gray)
    secondary: "#9CA3AF",
    secondaryLight: "#D1D5DB",
    secondaryDark: "#6B7280",

    // Success (Light Green)
    success: "#34D399",
    successLight: "#6EE7B7",
    successDark: "#10B981",

    // Error (Light Red)
    error: "#F87171",
    errorLight: "#FCA5A5",
    errorDark: "#EF4444",

    // Warning (Light Orange)
    warning: "#FBBF24",
    warningLight: "#FCD34D",
    warningDark: "#F59E0B",

    // Info (Light Blue)
    info: "#60A5FA",
    infoLight: "#93C5FD",
    infoDark: "#3B82F6",
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing: Record<SpacingKey, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius: Record<BorderRadiusKey, number> = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});

export const FontSizes: Record<FontSizeKey, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 32,
  heading: 28,
};

export const FontWeights: Record<FontWeightKey, "400" | "500" | "600" | "700"> =
  {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  };

export const LineHeights: Record<FontSizeKey, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 28,
  xxl: 32,
  title: 40,
  heading: 36,
};

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

export const Shadows: Record<ShadowKey, object> = Platform.select({
  ios: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  },
  android: {
    sm: {
      elevation: 2,
    },
    md: {
      elevation: 4,
    },
    lg: {
      elevation: 8,
    },
  },
  default: {
    sm: {},
    md: {},
    lg: {},
  },
}) as Record<ShadowKey, object>;
