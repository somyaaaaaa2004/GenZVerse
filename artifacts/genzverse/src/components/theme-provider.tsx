import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
};

const DEFAULT_ACCENT = "#D9FF00";

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  accentColor: DEFAULT_ACCENT,
  setTheme: () => null,
  setAccentColor: () => null,
});

function hexToHsl(hex: string): string | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return null;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyAccent(color: string) {
  const root = window.document.documentElement;
  root.style.setProperty("--user-accent", color);
  root.style.setProperty("--color-lime", color);
  const hsl = hexToHsl(color);
  if (hsl) {
    root.style.setProperty("--accent", hsl);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [accentColor, setAccentState] = useState<string>(
    () => localStorage.getItem(`${storageKey}-accent`) || DEFAULT_ACCENT,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    const apply = (resolved: "light" | "dark") => {
      root.classList.add(resolved);
    };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches ? "dark" : "light");
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }

    apply(theme);
    return;
  }, [theme]);

  useEffect(() => {
    applyAccent(accentColor);
  }, [accentColor]);

  const value: ThemeProviderState = {
    theme,
    accentColor,
    setTheme: (next) => {
      localStorage.setItem(storageKey, next);
      setThemeState(next);
    },
    setAccentColor: (color) => {
      localStorage.setItem(`${storageKey}-accent`, color);
      setAccentState(color);
      applyAccent(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
