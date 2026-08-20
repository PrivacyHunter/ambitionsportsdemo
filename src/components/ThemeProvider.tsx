import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSettings } from "@/lib/admin.functions";
import {
  DEFAULT_BRANDING,
  DEFAULT_THEME,
  parseJson,
  themeVars,
  type BrandingConfig,
  type ThemeConfig,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  theme: ThemeConfig;
  branding: BrandingConfig;
  /** Saved values (ignores unsaved live preview) */
  savedTheme: ThemeConfig;
  savedBranding: BrandingConfig;
  /** Live preview overrides used by the admin theme studio */
  setPreview: (next: { theme?: ThemeConfig; branding?: BrandingConfig } | null) => void;
  isPreviewing: boolean;
  refresh: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const MODE_KEY = "ambition-mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [preview, setPreviewState] = useState<{ theme?: ThemeConfig; branding?: BrandingConfig } | null>(null);

  const { data: settings, refetch } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => listSettings(),
    staleTime: 60_000,
  });

  const savedTheme = useMemo(
    () => parseJson<ThemeConfig>(settings?.["theme"], DEFAULT_THEME),
    [settings],
  );
  const savedBranding = useMemo(
    () => parseJson<BrandingConfig>(settings?.["branding"], DEFAULT_BRANDING),
    [settings],
  );

  const theme = preview?.theme ?? savedTheme;
  const branding = preview?.branding ?? savedBranding;

  // Mode is a per-visitor choice, restored after hydration to avoid mismatches.
  useEffect(() => {
    const stored = window.localStorage.getItem(MODE_KEY) as ThemeMode | null;
    setMode(stored ?? savedTheme.defaultMode);
  }, [savedTheme.defaultMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", mode === "light");
    root.classList.toggle("dark", mode === "dark");
    const vars = themeVars(theme, mode);
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
  }, [theme, mode]);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(MODE_KEY, next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    mode,
    toggleMode,
    theme,
    branding,
    savedTheme,
    savedBranding,
    setPreview: setPreviewState,
    isPreviewing: preview !== null,
    refresh: () => void refetch(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
