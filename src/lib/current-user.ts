import { getAccessToken } from "@/lib/axios";
import { getCurrentUserPermissions } from "@/lib/jwt-permissions";

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

/**
 * Does the caller hold this grant?
 *
 * These gates used to be one `hasElevatedRole()` check against a hardcoded list of three role
 * names, which was wrong in both directions. The API gates every one of these actions on a
 * permission — `[HasPermission("NearMiss.View")]` and friends — and allows all five roles on the
 * role list, so the UI was strictly narrower than what the caller could actually do: a Supervisor
 * holding `NearMiss.View` got a 200 from `/api/v1/near-miss/kpis` and an empty screen, because the
 * frontend refused to render what the backend had already returned.
 *
 * It also silently excluded `Ehs_Lead`. The list held `"lead"`, but a role normalizes to
 * `"ehs lead"`, so the one role the comment named as elevated never matched.
 *
 * Reading the permission instead means the two agree by construction — an admin ticks a box in
 * Roles & Rights and the UI follows, with no role special-cases to keep in step. Deliberately no
 * admin bypass: `Ehs_Director` holds every permission through the preset grant matrix, so it
 * passes on merit rather than on its name.
 *
 * Still a UX affordance, not a security boundary — the API enforces the same grant regardless.
 */
function holds(permission: string): boolean {
  return getCurrentUserPermissions().has(permission);
}

/**
 * True when the signed-in user may convert a near-miss to an incident.
 *
 * `NearMiss.Update` — the same grant the API's `POST {id}/convert-to-incident` requires.
 */
export function canConvertNearMissToIncident(): boolean {
  return holds("NearMiss.Update");
}

/** True when the signed-in user may close a near miss — `POST {id}/close`. */
export function canCloseNearMiss(): boolean {
  return holds("NearMiss.Update");
}

/** True when the signed-in user may edit a hazard. */
export function canEditHazard(): boolean {
  return holds("Hazard.Update");
}

/** True when the signed-in user may edit a near miss. */
export function canEditNearMiss(): boolean {
  return holds("NearMiss.Update");
}

/** True when the signed-in user may close a hazard — `POST {id}/close`. */
export function canCloseHazard(): boolean {
  return holds("Hazard.Update");
}

/**
 * True when the signed-in user may see the near-miss insight widgets (KPIs, heatmap,
 * recognition).
 *
 * `NearMiss.View`, matching the three endpoints that feed them. Note this is the same grant that
 * opens the register itself, so the tiles cannot currently be hidden from someone who can read
 * near misses at all — separating them needs a `NearMiss.Insights.View` on the backend.
 */
export function canViewNearMissInsights(): boolean {
  return holds("NearMiss.View");
}

/** True when the signed-in user may see the hazard insight widgets. Same caveat as above. */
export function canViewHazardInsights(): boolean {
  return holds("Hazard.View");
}

/**
 * True when the signed-in user may manage PPE inventory (catalog, View Issues).
 *
 * `PPE.Create` — what `POST /api/v1/ppe/items` requires. Deliberately not `PPE.Issue`, which
 * Supervisor holds: issuing from the catalogue is not the same trust as editing it. Users without
 * it see the issuance log on the PPE Management home instead.
 */
export function canManagePpeInventory(): boolean {
  return holds("PPE.Create");
}

/**
 * True when the signed-in user may verify and close a CAPA.
 *
 * `CAPA.Verify` — the grant `POST /api/v1/capas/{capaId}/verification` requires. This used
 * to be a hardcoded role list mirroring `CAPARepository.IsLeadership()`. That function no
 * longer exists: the repository now asks for this same permission, because
 * `PermissionSatisfiesRoleHandler` makes the permission the real gate on every endpoint,
 * and a custom role built in Roles & Rights can never match a list compiled from `AppRole`.
 *
 * It is its own grant rather than `CAPA.Update` for one reason: Supervisor holds Update, so
 * gating on that would have let a Supervisor sign off their own site's CAPAs.
 *
 * A UX affordance only — the API enforces the same grant, plus "verifier must be different
 * from the action owner" (see {@link isCapaOwnedByCurrentUser}).
 */
export function canVerifyCapa(): boolean {
  return holds("CAPA.Verify");
}

/**
 * True when the signed-in user may add, edit or remove a CAPA's tasks.
 *
 * `CAPA.Manage` — the supervisory tier. Worker holds `CAPA.Update` and keeps the task
 * status dropdown, but not this: tasks are set by whoever plans the action, not by whoever
 * works it.
 */
export function canManageCapaTasks(): boolean {
  return holds("CAPA.Manage");
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
