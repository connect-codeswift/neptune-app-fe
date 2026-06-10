export const SIGNUP_STORAGE_KEY = "neptune-signup";

export type SignupPersistedState = Readonly<{
  fullName: string;
  email: string;
  password: string;
}>;

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

export function loadSignupState(): SignupPersistedState | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const raw = globalThis.localStorage.getItem(SIGNUP_STORAGE_KEY);
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

  globalThis.localStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(state));
}

export function clearSignupState() {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.localStorage.removeItem(SIGNUP_STORAGE_KEY);
}
