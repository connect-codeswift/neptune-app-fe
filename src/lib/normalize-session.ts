import type {
  SessionBootstrapDto,
  SessionSiteDto,
} from "@/dtos/res/session-response.dto";
import { getAuthContext } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/current-user";

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

function asNullableString(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  return asString(value);
}

function asNullableNumber(value: unknown): number | null {
  if (value === null) {
    return null;
  }

  return asNumber(value);
}

function unwrapEnvelope(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  const dataModel = readProp(data, "dataModel", "DataModel");
  return dataModel ?? data;
}

function collectPermissionNames(
  value: unknown,
  permissions: Set<string>,
): void {
  if (typeof value === "string" && value.trim().length > 0) {
    permissions.add(value.trim());
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectPermissionNames(entry, permissions);
    }
    return;
  }

  if (isRecord(value)) {
    const name = asString(
      readProp(
        value,
        "displayName",
        "DisplayName",
        "permissionName",
        "PermissionName",
        "name",
        "Name",
        "right",
        "Right",
      ),
    );

    if (name) {
      permissions.add(name);
    }
  }
}

function extractPermissions(raw: Record<string, unknown>): string[] {
  const permissions = new Set<string>();

  for (const key of [
    "permissions",
    "Permissions",
    "permissionNames",
    "PermissionNames",
    "rights",
    "Rights",
  ]) {
    if (key in raw) {
      collectPermissionNames(raw[key], permissions);
    }
  }

  return [...permissions];
}

function extractActivatedModules(raw: Record<string, unknown>): string | null {
  const direct = readProp(raw, "activatedModules", "ActivatedModules");

  if (typeof direct === "string") {
    return direct;
  }

  if (Array.isArray(direct)) {
    const codes = direct
      .map((entry) => {
        if (typeof entry === "string") {
          return entry.trim();
        }

        if (isRecord(entry)) {
          return (
            asString(
              readProp(
                entry,
                "code",
                "Code",
                "moduleCode",
                "ModuleCode",
                "apiCode",
                "ApiCode",
                "name",
                "Name",
              ),
            ) ?? ""
          );
        }

        return "";
      })
      .filter(Boolean);

    return codes.length > 0 ? codes.join(",") : null;
  }

  if (isRecord(direct)) {
    const modules = readProp(direct, "modules", "Modules");
    if (typeof modules === "string") {
      return modules;
    }

    if (Array.isArray(modules)) {
      const codes = modules
        .map((entry) => {
          if (typeof entry === "string") {
            return entry.trim();
          }

          if (isRecord(entry)) {
            return (
              asString(
                readProp(
                  entry,
                  "code",
                  "Code",
                  "moduleCode",
                  "ModuleCode",
                  "apiCode",
                  "ApiCode",
                ),
              ) ?? ""
            );
          }

          return "";
        })
        .filter(Boolean);

      return codes.length > 0 ? codes.join(",") : null;
    }
  }

  return null;
}

function normalizeSites(raw: unknown): SessionSiteDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((site): SessionSiteDto | null => {
      if (!isRecord(site)) {
        return null;
      }

      const id = asNumber(readProp(site, "id", "Id"));
      const siteName = asString(readProp(site, "siteName", "SiteName"));

      if (id === null || !siteName) {
        return null;
      }

      return {
        id,
        siteName,
        location: asString(readProp(site, "location", "Location")) ?? "",
        industryType:
          asString(readProp(site, "industryType", "IndustryType")) ?? "",
        siteSize: asString(readProp(site, "siteSize", "SiteSize")) ?? "",
      };
    })
    .filter((site): site is SessionSiteDto => site !== null);
}

/** Normalize GET /Auth/Org/me — org-centric payload (`id` is organization id, not user id). */
export function normalizeOrgMeResponse(
  data: unknown,
): SessionBootstrapDto | null {
  const unwrapped = unwrapEnvelope(data);

  if (!isRecord(unwrapped)) {
    return null;
  }

  const sites = normalizeSites(readProp(unwrapped, "sites", "Sites"));

  return mergeJwtUserIntoSession({
    id: null,
    fullName: null,
    email: null,
    role: null,
    jobTitle: asString(readProp(unwrapped, "jobTitle", "JobTitle")),
    mfaEnabled: Boolean(readProp(unwrapped, "mfaEnabled", "MfaEnabled")),
    mfaPromptDismissed: Boolean(
      readProp(unwrapped, "mfaPromptDismissed", "MfaPromptDismissed"),
    ),
    organizationId: asNumber(
      readProp(unwrapped, "id", "Id", "organizationId", "OrganizationId"),
    ),
    organizationName: asString(
      readProp(
        unwrapped,
        "name",
        "Name",
        "organizationName",
        "OrganizationName",
      ),
    ),
    siteId: null,
    siteName: null,
    profileUrl: null,
    activatedModules: extractActivatedModules(unwrapped),
    permissions: [],
    sites,
    accessExpiresAt: asNullableString(
      readProp(unwrapped, "accessExpiresAt", "AccessExpiresAt"),
    ),
    daysRemaining: asNullableNumber(
      readProp(
        unwrapped,
        "daysRemaining",
        "DaysRemaining",
        "accessDaysRemaining",
        "AccessDaysRemaining",
      ),
    ),
    maxSeats: asNullableNumber(readProp(unwrapped, "maxSeats", "MaxSeats")),
    maxSites: asNullableNumber(readProp(unwrapped, "maxSites", "MaxSites")),
    seatsUsed: asNumber(readProp(unwrapped, "seatsUsed", "SeatsUsed")) ?? 0,
    sitesUsed: asNumber(readProp(unwrapped, "sitesUsed", "SitesUsed")) ?? 0,
    seatsAvailable: asNullableNumber(
      readProp(unwrapped, "seatsAvailable", "SeatsAvailable"),
    ),
    sitesAvailable: asNullableNumber(
      readProp(unwrapped, "sitesAvailable", "SitesAvailable"),
    ),
    atSeatLimit: Boolean(readProp(unwrapped, "atSeatLimit", "AtSeatLimit")),
    atSiteLimit: Boolean(readProp(unwrapped, "atSiteLimit", "AtSiteLimit")),
  });
}

/** Fill user/site identity from the access token after Org/me (which is org-scoped only). */
function mergeJwtUserIntoSession(
  session: SessionBootstrapDto,
): SessionBootstrapDto {
  const auth = getAuthContext();
  const currentUser = getCurrentUser();

  return {
    ...session,
    id: auth?.userId ?? currentUser.userId ?? session.id,
    fullName: auth?.fullName ?? session.fullName,
    email: auth?.email ?? session.email,
    role: currentUser.role ?? session.role,
    siteId: auth?.siteId ?? session.siteId,
    siteName: auth?.siteName ?? session.siteName,
    organizationId: session.organizationId ?? auth?.organizationId ?? null,
    organizationName:
      session.organizationName ?? auth?.organizationName ?? null,
  };
}

/** Normalize GET /Auth/GetUserById and similar user-entity payloads. */
export function normalizeSessionBootstrap(
  data: unknown,
): SessionBootstrapDto | null {
  const unwrapped = unwrapEnvelope(data);

  if (!isRecord(unwrapped)) {
    return null;
  }

  const sites = normalizeSites(readProp(unwrapped, "sites", "Sites"));

  return mergeJwtUserIntoSession({
    id: asNumber(readProp(unwrapped, "id", "Id", "userId", "UserId")),
    fullName: asString(readProp(unwrapped, "fullName", "FullName")),
    email: asString(readProp(unwrapped, "email", "Email")),
    role: asString(readProp(unwrapped, "role", "Role", "roleName", "RoleName")),
    jobTitle: asString(readProp(unwrapped, "jobTitle", "JobTitle")),
    mfaEnabled: Boolean(readProp(unwrapped, "mfaEnabled", "MfaEnabled")),
    mfaPromptDismissed: Boolean(
      readProp(unwrapped, "mfaPromptDismissed", "MfaPromptDismissed"),
    ),
    organizationId: asNumber(
      readProp(unwrapped, "organizationId", "OrganizationId"),
    ),
    organizationName: asString(
      readProp(unwrapped, "organizationName", "OrganizationName"),
    ),
    siteId: asNumber(readProp(unwrapped, "siteId", "SiteId")),
    siteName: asString(readProp(unwrapped, "siteName", "SiteName")),
    profileUrl: asString(readProp(unwrapped, "profileUrl", "ProfileUrl")),
    activatedModules: extractActivatedModules(unwrapped),
    permissions: extractPermissions(unwrapped),
    sites,
    accessExpiresAt: asNullableString(
      readProp(unwrapped, "accessExpiresAt", "AccessExpiresAt"),
    ),
    daysRemaining: asNullableNumber(
      readProp(
        unwrapped,
        "daysRemaining",
        "DaysRemaining",
        "accessDaysRemaining",
        "AccessDaysRemaining",
      ),
    ),
    maxSeats: asNullableNumber(readProp(unwrapped, "maxSeats", "MaxSeats")),
    maxSites: asNullableNumber(readProp(unwrapped, "maxSites", "MaxSites")),
    seatsUsed: asNumber(readProp(unwrapped, "seatsUsed", "SeatsUsed")) ?? 0,
    sitesUsed: asNumber(readProp(unwrapped, "sitesUsed", "SitesUsed")) ?? 0,
    seatsAvailable: asNullableNumber(
      readProp(unwrapped, "seatsAvailable", "SeatsAvailable"),
    ),
    sitesAvailable: asNullableNumber(
      readProp(unwrapped, "sitesAvailable", "SitesAvailable"),
    ),
    atSeatLimit: Boolean(readProp(unwrapped, "atSeatLimit", "AtSeatLimit")),
    atSiteLimit: Boolean(readProp(unwrapped, "atSiteLimit", "AtSiteLimit")),
  });
}

export function mergePermissionSets(
  ...sources: readonly (readonly string[] | Set<string>)[]
): Set<string> {
  const merged = new Set<string>();

  for (const source of sources) {
    if (source instanceof Set) {
      for (const permission of source) {
        merged.add(permission);
      }
      continue;
    }

    for (const permission of source) {
      if (permission.trim().length > 0) {
        merged.add(permission.trim());
      }
    }
  }

  return merged;
}

export function hasSessionData(
  session: SessionBootstrapDto | null | undefined,
): boolean {
  if (!session) {
    return false;
  }

  return Boolean(
    session.fullName ||
    session.email ||
    session.role ||
    session.organizationName ||
    session.activatedModules ||
    session.permissions.length > 0 ||
    session.sites.length > 0,
  );
}
