import { getAccessToken } from "@/lib/axios";

export type AuthContext = Readonly<{
  userId: number;
  /** Tenant site id from the SiteId JWT claim (formerly SubCompanyId). */
  siteId: number;
  /** @deprecated Alias for `siteId` — kept during the site rename rollout. */
  subCompanyId: number;
  siteName: string | null;
  organizationId: number | null;
  organizationName: string | null;
  email: string | null;
  fullName: string | null;
}>;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) {
      return null;
    }

    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json = globalThis.atob(padded);
    const parsed: unknown = JSON.parse(json);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readClaim(
  payload: Record<string, unknown>,
  keys: readonly string[],
): unknown {
  for (const key of keys) {
    if (key in payload) {
      return payload[key];
    }
  }

  return undefined;
}

function toNonNegativeInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.trunc(parsed);
    }
  }

  return null;
}

function toOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * Reads tenant/user ids from the access-token JWT.
 * Falls back to `0` for missing claims (matches Swagger GetAllIncidents example).
 */
export function getAuthContext(): AuthContext | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return {
      userId: 0,
      siteId: 0,
      subCompanyId: 0,
      siteName: null,
      organizationId: null,
      organizationName: null,
      email: null,
      fullName: null,
    };
  }

  const siteId =
    toNonNegativeInt(
      readClaim(payload, [
        "siteId",
        "SiteId",
        "site_id",
        "subCompanyId",
        "SubCompanyId",
        "subcompanyId",
        "SubCompId",
        "subCompId",
      ]),
    ) ?? 0;

  return {
    userId:
      toNonNegativeInt(
        readClaim(payload, [
          "userId",
          "UserId",
          "nameid",
          "sub",
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        ]),
      ) ?? 0,
    siteId,
    subCompanyId: siteId,
    siteName: toOptionalString(
      readClaim(payload, [
        "siteName",
        "SiteName",
        "subCompanyName",
        "SubCompanyName",
      ]),
    ),
    organizationId: toNonNegativeInt(
      readClaim(payload, [
        "organizationId",
        "OrganizationId",
        "orgId",
        "OrgId",
      ]),
    ),
    organizationName: toOptionalString(
      readClaim(payload, [
        "organizationName",
        "OrganizationName",
        "orgName",
        "OrgName",
      ]),
    ),
    email: toOptionalString(
      readClaim(payload, [
        "email",
        "Email",
        "unique_name",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
      ]),
    ),
    fullName: toOptionalString(
      readClaim(payload, [
        "fullName",
        "FullName",
        "name",
        "Name",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      ]),
    ),
  };
}

/** Display name for the signed-in user (full name → email local-part → fallback). */
export function getAuthDisplayName(fallback = "You"): string {
  const auth = getAuthContext();
  if (!auth) {
    return fallback;
  }

  if (auth.fullName) {
    return auth.fullName;
  }

  if (auth.email) {
    const local = auth.email.split("@")[0]?.trim();
    if (local) {
      return local
        .split(/[._-]+/)
        .filter(Boolean)
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(" ");
    }
  }

  return fallback;
}
