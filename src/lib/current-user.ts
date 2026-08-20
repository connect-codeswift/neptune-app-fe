import { getAccessToken } from "@/lib/axios";

/**
 * Reads identity claims from the stored `neptune-access-token` JWT.
 *
 * The token is only *decoded* here (not verified) so we can read the
 * user id / sub-company id the backend embeds as claims. Signature
 * verification stays server-side.
 */

type JwtClaims = Record<string, unknown>;

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  if (typeof globalThis.atob === "function") {
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(padded, "base64").toString("utf-8");
}

/** Decode the JWT payload of the stored access token, or null if absent/invalid. */
export function decodeAccessTokenClaims(): JwtClaims | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    return JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  } catch {
    return null;
  }
}

/** Return the first claim (by candidate key) that parses to a finite number. */
function readNumericClaim(
  claims: JwtClaims,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return null;
}

// Adjust these if the backend uses different claim names in the JWT.
const USER_ID_CLAIM_KEYS = [
  "userId",
  "UserId",
  "user_id",
  "nameid",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  "sub",
  "id",
] as const;

const SITE_ID_CLAIM_KEYS = [
  "siteId",
  "SiteId",
  "site_id",
  // Legacy claims from tokens issued before the site rename.
  "subCompanyId",
  "SubCompanyId",
  "sub_company_id",
  "subcompanyId",
  "SubCompId",
  "subCompId",
  "subCompany",
  "companyId",
] as const;

const ORGANIZATION_NAME_CLAIM_KEYS = [
  "organizationName",
  "OrganizationName",
  "org",
  "Org",
] as const;

// Adjust if the backend embeds the role under a different claim name.
const ROLE_CLAIM_KEYS = [
  "role",
  "Role",
  "roleName",
  "RoleName",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
] as const;

/** Return the first claim (by candidate key) that is a non-empty string. */
function readStringClaim(
  claims: JwtClaims,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = claims[key];
    // A role claim can be an array (multiple roles); take the first entry.
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return null;
}

export type CurrentUser = Readonly<{
  userId: number;
  /** Tenant site id from the SiteId JWT claim (formerly SubCompanyId). */
  siteId: number;
  /** @deprecated Alias for `siteId` — kept during the site rename rollout. */
  subCompanyId: number;
  /** Tenant database name, e.g. "Acme" — from Organizations.Name in the JWT. */
  organizationName: string;
  role: string | null;
}>;

/**
 * Extract `userId` / `siteId` / `organizationName` / `role` from the access token's claims.
 * `subCompanyId` mirrors `siteId` for callers still on the old name.
 * Falls back to 0 / "" / null when the token is missing or a claim isn't present.
 */
export function getCurrentUser(): CurrentUser {
  const claims = decodeAccessTokenClaims();
  if (!claims) {
    return {
      userId: 0,
      siteId: 0,
      subCompanyId: 0,
      organizationName: "",
      role: null,
    };
  }

  const siteId = readNumericClaim(claims, SITE_ID_CLAIM_KEYS) ?? 0;

  return {
    userId: readNumericClaim(claims, USER_ID_CLAIM_KEYS) ?? 0,
    siteId,
    subCompanyId: siteId,
    organizationName:
      readStringClaim(claims, ORGANIZATION_NAME_CLAIM_KEYS) ?? "",
    role: readStringClaim(claims, ROLE_CLAIM_KEYS) ?? null,
  };
}

/** Normalize a role label for comparison: lowercase, single-spaced. */
function normalizeRole(role: string): string {
  return role.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

/** Roles trusted with elevated safety actions. */
const ELEVATED_ROLES: readonly string[] = [
  "ehs manager",
  "ehs director",
  "lead",
];

/** True when the signed-in user holds one of {@link ELEVATED_ROLES}. */
function hasElevatedRole(): boolean {
  const { role } = getCurrentUser();
  return role !== null && ELEVATED_ROLES.includes(normalizeRole(role));
}

/**
 * True when the signed-in user's role may convert a near-miss to an incident
 * (EHS Manager, EHS Director, or Lead).
 */
export function canConvertNearMissToIncident(): boolean {
  return hasElevatedRole();
}

/** True when the signed-in user's role may close a near miss — same roles. */
export function canCloseNearMiss(): boolean {
  return hasElevatedRole();
}

/** True when the signed-in user's role may edit a hazard — same roles. */
export function canEditHazard(): boolean {
  return hasElevatedRole();
}

/** True when the signed-in user's role may edit a near miss — same roles. */
export function canEditNearMiss(): boolean {
  return hasElevatedRole();
}

/** True when the signed-in user's role may close a hazard — same roles. */
export function canCloseHazard(): boolean {
  return hasElevatedRole();
}

/**
 * True when the signed-in user may see the near-miss insight widgets (KPIs,
 * heatmap, recognition) — same roles.
 */
export function canViewNearMissInsights(): boolean {
  return hasElevatedRole();
}
export function canViewHazardInsights(): boolean {
  return hasElevatedRole();
}

/**
 * True when the signed-in user may manage PPE inventory (catalog, View Issues)
 * — EHS Manager, EHS Director, or Lead. Non-elevated users see the issuance log
 * on the PPE Management home instead.
 */
export function canManagePpeInventory(): boolean {
  return hasElevatedRole();
}

/**
 * Roles the backend lets sign off a CAPA verification — `CAPARepository.IsLeadership()`
 * matches `Ehs_Director`, `Ehs_Lead` and `Ehs_Manager` on POST
 * /api/v1/capas/{capaId}/verification. Both the `Ehs_`-prefixed claim and the bare
 * `Lead` label are listed because tenants seeded before the role rename still emit
 * the short form — the same reason `ELEVATED_ROLES` above carries it.
 */
const CAPA_VERIFIER_ROLES: readonly string[] = [
  "ehs director",
  "ehs lead",
  "ehs manager",
  "lead",
];

/**
 * True when the signed-in user may verify and close a CAPA. Supervisors and
 * Workers can see the review queue but never sign one off.
 *
 * This is a UX affordance only — the API enforces the same rule, plus
 * "verifier must be different from the action owner" (see {@link isCapaOwnedByCurrentUser}).
 */
export function canVerifyCapa(): boolean {
  const { role } = getCurrentUser();
  return role !== null && CAPA_VERIFIER_ROLES.includes(normalizeRole(role));
}

/**
 * True when the CAPA is assigned to the signed-in user. The backend rejects a
 * self-verification ("Verifier must be different from the action owner"), so the
 * UI must not offer the action.
 */
export function isCapaOwnedByCurrentUser(
  assignedId: number | null | undefined,
): boolean {
  if (assignedId == null || assignedId <= 0) {
    return false;
  }

  const { userId } = getCurrentUser();
  return userId > 0 && userId === assignedId;
}
