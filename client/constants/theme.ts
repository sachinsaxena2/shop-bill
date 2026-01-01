import { Platform } from "react-native";

export const BrandColors = {
  primary: "#7B2D8E",
  primaryDark: "#5A1F6A",
  primaryLight: "#9B4DB0",
  secondary: "#E45DF0",
  secondaryDark: "#C040CC",
  success: "#2E7D32",
  error: "#B00020",
  warning: "#F57C00",
  whatsapp: "#25D366",
};

export const Colors = {
  light: {
    text: "#3D1A45",
    textSecondary: "#6B4A70",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8B6B90",
    tabIconSelected: BrandColors.primary,
    link: BrandColors.primary,
    primary: BrandColors.primary,
    primaryDark: BrandColors.primaryDark,
    secondary: BrandColors.secondary,
    success: BrandColors.success,
    error: BrandColors.error,
    warning: BrandColors.warning,
    whatsapp: BrandColors.whatsapp,
    backgroundRoot: "#FBE8FC",
    backgroundDefault: "#FBE8FC",
    backgroundSecondary: "#F6D2FA",
    backgroundTertiary: "#EEC4F2",
    cardBackground: "#FFFFFF",
    border: "#D9A8DD",
    inputBackground: "#FFFFFF",
    inputBorder: "#C89ACC",
    placeholder: "#9E7AA2",
    divider: "#D9A8DD",
    overlay: "rgba(61, 26, 69, 0.5)",
  },
  dark: {
    text: "#F5E6F7",
    textSecondary: "#C9B0CC",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9B7A9F",
    tabIconSelected: BrandColors.secondary,
    link: BrandColors.secondary,
    primary: BrandColors.secondary,
    primaryDark: BrandColors.primary,
    secondary: BrandColors.secondary,
    success: "#4CAF50",
    error: "#CF6679",
    warning: "#FFB74D",
    whatsapp: BrandColors.whatsapp,
    backgroundRoot: "#2A1A2E",
    backgroundDefault: "#3A2A3E",
    backgroundSecondary: "#4A3A4E",
    backgroundTertiary: "#5A4A5E",
    cardBackground: "#3A2A3E",
    border: "#5A4A5E",
    inputBackground: "#4A3A4E",
    inputBorder: "#6A5A6E",
    placeholder: "#8A7A8E",
    divider: "#5A4A5E",
    overlay: "rgba(42, 26, 46, 0.7)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
  fabSize: 56,
  fabOffset: 16,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  price: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  priceTotal: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
};

export const Shadows = {
  small: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  large: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "'Poppins', 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const DefaultCategories = [
  { id: "suit", label: "Suit", icon: "shopping-bag" },
  { id: "kurti", label: "Kurti", icon: "layout" },
  { id: "top", label: "Top", icon: "airplay" },
  { id: "jewellery", label: "Jewellery", icon: "award" },
  { id: "trousers", label: "Trousers", icon: "align-left" },
  { id: "pants", label: "Pants", icon: "sidebar" },
] as const;

export type CategoryId = string;
