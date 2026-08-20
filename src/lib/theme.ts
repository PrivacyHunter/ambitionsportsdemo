export type ThemeMode = "dark" | "light";

export type ThemeConfig = {
  goldAccent: string;
  cyanAccent: string;
  darkBackground: string;
  lightBackground: string;
  displayFont: string;
  bodyFont: string;
  displayTracking: string;
  radius: string;
  sectionSpace: string;
  containerWidth: string;
  glassOpacity: number;
  defaultMode: ThemeMode;
};

export const DEFAULT_THEME: ThemeConfig = {
  goldAccent: "#d4af37",
  cyanAccent: "#7fe9ff",
  darkBackground: "#080a0f",
  lightBackground: "#ffffff",
  displayFont: '"Syne", "Space Grotesk", sans-serif',
  bodyFont: '"Plus Jakarta Sans", "Inter", sans-serif',
  displayTracking: "-0.03em",
  radius: "0.9rem",
  sectionSpace: "6rem",
  containerWidth: "80rem",
  glassOpacity: 3,
  defaultMode: "dark",
};

export const FONT_PRESETS = [
  { label: "Syne / Plus Jakarta", display: '"Syne", sans-serif', body: '"Plus Jakarta Sans", sans-serif' },
  { label: "Space Grotesk / Inter", display: '"Space Grotesk", sans-serif', body: '"Inter", sans-serif' },
  { label: "Syne / Inter", display: '"Syne", sans-serif', body: '"Inter", sans-serif' },
];

export type BrandingConfig = {
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  showNotificationBar: boolean;
  notificationText: string;
  showTopInfoBar: boolean;
  showSocialIcons: boolean;
  showFooterCredit: boolean;
  footerCreditText: string;
  footerDescription: string;
  showWhatsappButton: boolean;
  whatsappNumber: string;
  phone: string;
  email: string;
};

export const DEFAULT_BRANDING: BrandingConfig = {
  logoText: "Ambition Sports",
  logoUrl: "",
  faviconUrl: "",
  showNotificationBar: true,
  notificationText: "Premium Custom Sportswear — Worldwide Shipping Available",
  showTopInfoBar: true,
  showSocialIcons: true,
  showFooterCredit: true,
  footerCreditText: "Crafted by Ambition Sports Studio",
  footerDescription: "Premium custom sportswear and activewear manufacturer based in Sialkot, Pakistan. Delivering high-performance apparel worldwide.",
  showWhatsappButton: true,
  whatsappNumber: "+923001234567",
  phone: "+92 (300) 123-4567",
  email: "sales@ambitionsports.com",
};

/** CSS custom properties derived from a theme config. */
export function themeVars(theme: ThemeConfig, mode: ThemeMode): Record<string, string> {
  return {
    "--gold": theme.goldAccent,
    "--neon-lime": theme.goldAccent,
    "--primary": theme.goldAccent,
    "--ring": theme.goldAccent,
    "--accent": theme.cyanAccent,
    "--neon-cyan": theme.cyanAccent,
    "--background": mode === "dark" ? theme.darkBackground : theme.lightBackground,
    "--font-display-family": theme.displayFont,
    "--font-body-family": theme.bodyFont,
    "--display-tracking": theme.displayTracking,
    "--radius": theme.radius,
    "--section-space": theme.sectionSpace,
    "--container-width": theme.containerWidth,
    "--surface": `rgb(${mode === "dark" ? "255 255 255" : "11 15 25"} / ${theme.glassOpacity}%)`,
    "--surface-strong": `rgb(${mode === "dark" ? "255 255 255" : "11 15 25"} / ${theme.glassOpacity * 2}%)`,
  };
}

export function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}
