const SIGNUP_STORAGE_KEY = "neptune-signup";

/**
 * Held in sessionStorage, not localStorage.
 *
 * Registration only happens at the end of the onboarding wizard, so the
 * credentials entered on /signup have to survive the navigation to
 * /onboarding and a refresh part-way through it — which rules out keeping
 * them in memory alone. sessionStorage is the narrowest store that still
 * does that: scoped to the one tab, never written to disk, and gone when the
 * tab closes, where localStorage kept the password readable indefinitely.
 *
 * It is still readable by script on this origin, so callers clear it as soon
 * as registration succeeds. Removing client-side password storage entirely
 * would mean registering at signup and onboarding afterwards.
 */

export type SignupPersistedState = Readonly<{
  fullName: string;
  email: string;
  password: string;
}>;

export type SignupFormInitialValues = Readonly<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}>;

const emptySignupFormInitialValues: SignupFormInitialValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSignupState(value: unknown): SignupPersistedState | null {
  if (!isRecord(value)) {
    return null;
  }

  const fullName =
    typeof value.fullName === "string" ? value.fullName.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const password = typeof value.password === "string" ? value.password : "";

  if (!fullName || !email || !password) {
    return null;
  }

  return { fullName, email, password };
}

export function getSignupFormInitialValues(): SignupFormInitialValues {
  const saved = loadSignupState();

  if (!saved) {
    return emptySignupFormInitialValues;
  }

  return {
    fullName: saved.fullName,
    email: saved.email,
    password: saved.password,
    confirmPassword: saved.password,
    acceptTerms: true,
  };
}

export function loadSignupState(): SignupPersistedState | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const raw = globalThis.sessionStorage.getItem(SIGNUP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeSignupState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSignupState(state: SignupPersistedState) {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.sessionStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(state));
}

export function clearSignupState() {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.sessionStorage.removeItem(SIGNUP_STORAGE_KEY);
}
