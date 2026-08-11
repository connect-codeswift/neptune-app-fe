const ORG_ACCESS_EXPIRED_MESSAGE =
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
export function unwrapAuthPayload(
  data: unknown,
): Record<string, unknown> | null {
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

/**
 * "14 days left" / "1 day left" / "Ends today", for the sidebar card.
 *
 * Short because it sits in a 256px column under the nav. The full sentence the
 * banner used ("Your organization's access ends in 14 days…") wrapped to three
 * lines there and read as a warning rather than a status.
 */
export function formatAccessWindowRemaining(
  daysRemaining: number | null | undefined,
): string {
  const days = daysRemaining ?? 0;

  if (days <= 0) {
    return "Ends today";
  }

  if (days === 1) {
    return "1 day left";
  }

  return `${String(days)} days left`;
}

/** Date only — the sidebar has no room for a timestamp, and 2:15 AM told nobody anything. */
export function formatAccessWindowExpiry(accessExpiresAt: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(accessExpiresAt),
  );
}

let cachedAccessWindowRaw: string | null | undefined;
let cachedAccessWindowSnapshot: AccessWindowState | null = null;

function parseCachedAccessWindow(raw: string | null): AccessWindowState | null {
  if (!raw) {
    return null;
  }

  try {
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

export function getCachedAccessWindow(): AccessWindowState | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const raw = globalThis.sessionStorage.getItem(ACCESS_WINDOW_STORAGE_KEY);

    if (raw === cachedAccessWindowRaw) {
      return cachedAccessWindowSnapshot;
    }

    cachedAccessWindowRaw = raw;
    cachedAccessWindowSnapshot = parseCachedAccessWindow(raw);
    return cachedAccessWindowSnapshot;
  } catch {
    cachedAccessWindowRaw = null;
    cachedAccessWindowSnapshot = null;
    return null;
  }
}

export function setCachedAccessWindow(window: AccessWindowState | null) {
  if (globalThis.window === undefined) {
    return;
  }

  if (!window) {
    globalThis.sessionStorage.removeItem(ACCESS_WINDOW_STORAGE_KEY);
    cachedAccessWindowRaw = null;
    cachedAccessWindowSnapshot = null;
    return;
  }

  const raw = JSON.stringify(window);
  globalThis.sessionStorage.setItem(ACCESS_WINDOW_STORAGE_KEY, raw);
  cachedAccessWindowRaw = raw;
  cachedAccessWindowSnapshot = window;
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
