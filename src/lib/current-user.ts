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

const SUB_COMPANY_ID_CLAIM_KEYS = [
  "subCompanyId",
  "SubCompanyId",
  "sub_company_id",
  "subcompanyId",
  "subCompany",
  "companyId",
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
  subCompanyId: number;
  role: string | null;
}>;

/**
 * Extract `userId` / `subCompanyId` / `role` from the access token's claims.
 * Falls back to 0 / null when the token is missing or a claim isn't present.
 */
export function getCurrentUser(): CurrentUser {
  const claims = decodeAccessTokenClaims();
  if (!claims) return { userId: 0, subCompanyId: 0, role: null };

  return {
    userId: readNumericClaim(claims, USER_ID_CLAIM_KEYS) ?? 0,
    subCompanyId: readNumericClaim(claims, SUB_COMPANY_ID_CLAIM_KEYS) ?? 0,
    role: readStringClaim(claims, ROLE_CLAIM_KEYS),
  };
}

/** Normalize a role label for comparison: lowercase, single-spaced. */
function normalizeRole(role: string): string {
  return role.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

/** Roles permitted to convert a near-miss into a full incident. */
const CONVERT_INCIDENT_ROLES: readonly string[] = [
  "ehs manager",
  "ehs director",
  "lead",
];

/**
 * True when the signed-in user's role may convert a near-miss to an incident
 * (EHS Manager, EHS Director, or Lead).
 */
export function canConvertNearMissToIncident(): boolean {
  const { role } = getCurrentUser();
  return role !== null && CONVERT_INCIDENT_ROLES.includes(normalizeRole(role));
}
