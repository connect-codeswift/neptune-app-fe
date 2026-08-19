/**
 * Theme preference — what the user chose — versus resolved theme, which is what the page
 * actually paints. "system" is a preference, never a resolved value: it is turned into
 * "light" or "dark" by asking the OS, and re-resolved when the OS setting changes.
 *
 * The distinction matters because the whole app keys off a concrete `data-theme` attribute on
 * `<html>`. Leaving it unset for "system" and relying on `prefers-color-scheme` in CSS would
 * work for tokens but not for Tailwind's `dark:` variant, which is pointed at the attribute —
 * so the two would disagree exactly for the users who never touched the setting.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "neptune-theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** The stored preference, or the default when nothing is stored or storage is unavailable. */
export function readStoredThemePreference(): ThemePreference {
  if (typeof globalThis.localStorage === "undefined") {
    return DEFAULT_THEME_PREFERENCE;
  }

  try {
    const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    // Private-mode Safari and locked-down enterprise profiles throw on access.
    return DEFAULT_THEME_PREFERENCE;
  }
}

export function storeThemePreference(preference: ThemePreference): void {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A theme that does not survive a reload is better than a crash on the click.
  }
}

export function prefersDarkColorScheme(): boolean {
  return Boolean(globalThis.matchMedia?.(DARK_MEDIA_QUERY).matches);
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") {
    return prefersDarkColorScheme() ? "dark" : "light";
  }

  return preference;
}

/** Subscribe to OS-level changes. Returns the unsubscribe function. */
export function subscribeToColorSchemeChange(
  onChange: (prefersDark: boolean) => void,
): () => void {
  const media = globalThis.matchMedia?.(DARK_MEDIA_QUERY);

  if (!media) {
    return () => undefined;
  }

  const handler = (event: MediaQueryListEvent) => onChange(event.matches);
  media.addEventListener("change", handler);

  return () => media.removeEventListener("change", handler);
}

/**
 * Writes the resolved theme onto `<html>`.
 *
 * `color-scheme` is set alongside the attribute so the browser's own surfaces — form controls,
 * scrollbars, the flash of canvas before paint — follow the app instead of staying light on a
 * dark page.
 */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  const root = globalThis.document?.documentElement;

  if (!root) {
    return;
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/**
 * Runs before first paint, inlined into <head>.
 *
 * Without it the page renders light, then the provider mounts and flips it — a white flash on
 * every navigation for dark-mode users. It is duplicated logic on purpose: it must not import
 * anything, because module loading is exactly the wait it exists to avoid. Keep it in step with
 * {@link readStoredThemePreference} and {@link resolveTheme}.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}");if(p!=="light"&&p!=="dark"&&p!=="system"){p="${DEFAULT_THEME_PREFERENCE}"}var t=p==="system"?(window.matchMedia("${DARK_MEDIA_QUERY}").matches?"dark":"light"):p;document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;
