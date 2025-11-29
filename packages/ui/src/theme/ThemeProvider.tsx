'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type ThemeMode = "dark" | "light";
type MotionPreference = "system" | "reduce";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  motion: MotionPreference;
  setMotion: (motion: MotionPreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  mode: "nativeiq.theme.mode",
  contrast: "nativeiq.theme.contrast",
  motion: "nativeiq.theme.motion"
} as const;

const isBrowser = typeof window !== "undefined";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (!isBrowser) return "dark";
    const stored = window.localStorage.getItem(STORAGE_KEYS.mode) as ThemeMode | null;
    if (stored === "dark" || stored === "light") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (!isBrowser) return false;
    return window.localStorage.getItem(STORAGE_KEYS.contrast) === "true";
  });

  const [motion, setMotionState] = useState<MotionPreference>(() => {
    if (!isBrowser) return "system";
    const stored = window.localStorage.getItem(STORAGE_KEYS.motion) as MotionPreference | null;
    return stored === "reduce" ? "reduce" : "system";
  });

  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem(STORAGE_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    if (!isBrowser) return;
    document.documentElement.dataset.highContrast = highContrast ? "true" : "false";
    window.localStorage.setItem(STORAGE_KEYS.contrast, highContrast ? "true" : "false");
  }, [highContrast]);

  useEffect(() => {
    if (!isBrowser) return;
    const reduce = motion === "reduce";
    document.documentElement.dataset.reducedMotion = reduce ? "true" : "false";
    window.localStorage.setItem(STORAGE_KEYS.motion, motion);
  }, [motion]);

  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const setMotion = useCallback((value: MotionPreference) => {
    setMotionState(value);
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, highContrast, toggleHighContrast, motion, setMotion }),
    [mode, setMode, highContrast, toggleHighContrast, motion, setMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
