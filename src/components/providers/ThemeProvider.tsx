"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyResolvedTheme,
  DEFAULT_THEME_PREFERENCE,
  readStoredThemePreference,
  resolveTheme,
  storeThemePreference,
  subscribeToColorSchemeChange,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

export type ThemeContextValue = Readonly<{
  /** What the user chose — "system" included. */
  preference: ThemePreference;
  /** What is actually painted right now. Never "system". */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /**
   * False during SSR and the first client render, true once the stored preference has been
   * read. Controls that show the current choice must wait for it, or they render the default
   * on the server and the real value on the client — a hydration mismatch.
   */
  isReady: boolean;
}>;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = Readonly<{ children: ReactNode }>;

/**
 * Owns the theme preference and keeps `<html data-theme>` in step with it.
 *
 * The attribute itself is written before this mounts, by the inline script in the root layout —
 * this provider adopts that value rather than racing it. What it adds is the React-visible
 * state, persistence, and the live OS listener that "system" needs.
 */
export function ThemeProvider(props: Readonly<ThemeProviderProps>) {
  const { children } = props;

  // Deliberately the default, not the stored value: this runs on the server too, where
  // localStorage does not exist, and any other seed would hydrate mismatched.
  const [preference, setPreferenceState] = useState<ThemePreference>(
    DEFAULT_THEME_PREFERENCE,
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readStoredThemePreference();
    setPreferenceState(stored);
    setResolvedTheme(resolveTheme(stored));
    setIsReady(true);
  }, []);

  // Only "system" tracks the OS. An explicit choice must survive the user changing their
  // desktop theme, which is the entire point of making it explicit.
  useEffect(() => {
    if (preference !== "system") {
      return;
    }

    return subscribeToColorSchemeChange((prefersDark) => {
      const next: ResolvedTheme = prefersDark ? "dark" : "light";
      setResolvedTheme(next);
      applyResolvedTheme(next);
    });
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    const resolved = resolveTheme(next);

    setPreferenceState(next);
    setResolvedTheme(resolved);
    storeThemePreference(next);

    // Written straight to the DOM rather than through an effect: the attribute drives every
    // colour on the page, and going through a render pass first shows one frame of the old
    // theme behind the new toggle position.
    applyResolvedTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ preference, resolvedTheme, setPreference, isReady }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }

  return context;
}
