export const ORG_ACCESS_EXPIRED_MESSAGE =
  "This organization's access period has ended. Contact CodeSwift to continue.";

export type AccessWindowState = Readonly<{
  accessExpiresAt: string;
  daysRemaining: number;
}>;

const ACCESS_WINDOW_STORAGE_KEY = "neptune-access-window";
const AUTH_REDIRECT_MESSAGE_KEY = "neptune-auth-redirect-message";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }

  return null;
}

/** Unwrap the standard API envelope, tolerating a bare auth payload. */
export function unwrapAuthPayload(data: unknown): Record<string, unknown> | null {
  if (!isRecord(data)) {
    return null;
  }

  const inner = readProp(data, "dataModel", "DataModel");

  if (isRecord(inner)) {
    return inner;
  }

  return data;
}

/** Read optional access-window fields from login / refresh / verify-mfa payloads. */
export function readAccessWindowFromAuthPayload(
  data: unknown,
): AccessWindowState | null {
  const payload = unwrapAuthPayload(data);

  if (!payload) {
    return null;
  }

  const accessExpiresAt = asString(
    readProp(payload, "accessExpiresAt", "AccessExpiresAt"),
  );
  const daysRemaining = asNumber(
    readProp(
      payload,
      "accessDaysRemaining",
      "AccessDaysRemaining",
      "daysRemaining",
      "DaysRemaining",
    ),
  );

  if (!accessExpiresAt || daysRemaining === null) {
    return null;
  }

  return { accessExpiresAt, daysRemaining };
}

export function isOrgAccessExpiredMessage(message: string): boolean {
  return message.trim() === ORG_ACCESS_EXPIRED_MESSAGE;
}

/** True when the org has a time-boxed window (Org/me or auth responses). */
export function shouldShowAccessWindowBanner(
  accessExpiresAt: string | null | undefined,
): boolean {
  return accessExpiresAt != null && accessExpiresAt !== "";
}

export function formatAccessWindowBannerMessage(
  daysRemaining: number | null | undefined,
  accessExpiresAt: string,
): string {
  const days = daysRemaining ?? 0;
  const expiryLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(accessExpiresAt));

  if (days <= 0) {
    return `Your organization's access ends today (${expiryLabel}). Contact CodeSwift to continue after expiry.`;
  }

  if (days === 1) {
    return `Your organization's access ends in 1 day (${expiryLabel}). Contact CodeSwift to extend access.`;
  }

  return `Your organization's access ends in ${days} days (${expiryLabel}). Contact CodeSwift to extend access.`;
}

export function getCachedAccessWindow(): AccessWindowState | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const raw = globalThis.sessionStorage.getItem(ACCESS_WINDOW_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const accessExpiresAt = asString(parsed.accessExpiresAt);
    const daysRemaining = asNumber(parsed.daysRemaining);

    if (!accessExpiresAt || daysRemaining === null) {
      return null;
    }

    return { accessExpiresAt, daysRemaining };
  } catch {
    return null;
  }
}

export function setCachedAccessWindow(window: AccessWindowState | null) {
  if (globalThis.window === undefined) {
    return;
  }

  if (!window) {
    globalThis.sessionStorage.removeItem(ACCESS_WINDOW_STORAGE_KEY);
    return;
  }

  globalThis.sessionStorage.setItem(
    ACCESS_WINDOW_STORAGE_KEY,
    JSON.stringify(window),
  );
}

export function setAuthRedirectMessage(message: string) {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.sessionStorage.setItem(AUTH_REDIRECT_MESSAGE_KEY, message);
}

export function consumeAuthRedirectMessage(): string | null {
  if (globalThis.window === undefined) {
    return null;
  }

  const message = globalThis.sessionStorage.getItem(AUTH_REDIRECT_MESSAGE_KEY);

  if (message) {
    globalThis.sessionStorage.removeItem(AUTH_REDIRECT_MESSAGE_KEY);
  }

  return message;
}

export function redirectToLoginFromAppShell() {
  if (globalThis.window === undefined) {
    return;
  }

  const path = globalThis.window.location.pathname;

  if (
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forget-password")
  ) {
    return;
  }

  globalThis.window.location.assign("/login");
}
