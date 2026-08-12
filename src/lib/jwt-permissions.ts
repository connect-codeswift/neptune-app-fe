import { getAccessToken } from "@/lib/axios";
import { decodeAccessTokenClaims } from "@/lib/current-user";

function addPermissionValue(
  permissions: Set<string>,
  value: unknown,
): void {
  if (typeof value === "string" && value.trim().length > 0) {
    permissions.add(value.trim());
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      addPermissionValue(permissions, entry);
    }
  }
}

/** Collect every `Permission` claim from a decoded JWT payload. */
export function getPermissionsFromClaims(
  payload: Record<string, unknown> | null,
): Set<string> {
  const permissions = new Set<string>();

  if (!payload) {
    return permissions;
  }

  addPermissionValue(permissions, payload.Permission ?? payload.permission);

  for (const [key, value] of Object.entries(payload)) {
    if (key.toLowerCase() === "permission") {
      addPermissionValue(permissions, value);
    }
  }

  return permissions;
}

/** Read permission claims from the stored access token. */
export function getPermissionsFromToken(token?: string | null): Set<string> {
  if (token) {
    try {
      const segment = token.split(".")[1];
      if (!segment) {
        return new Set();
      }

      const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "=",
      );
      const parsed: unknown = JSON.parse(globalThis.atob(padded));

      if (typeof parsed === "object" && parsed !== null) {
        return getPermissionsFromClaims(parsed as Record<string, unknown>);
      }
    } catch {
      return new Set();
    }
  }

  return getPermissionsFromClaims(decodeAccessTokenClaims());
}

/** Convenience wrapper that reads the stored access token. */
export function getCurrentUserPermissions(): Set<string> {
  return getPermissionsFromToken(getAccessToken());
}

/**
 * The company owner bypasses permission checks in the UI, as it does on the backend —
 * Ehs_Director holds every permission except the admin portal's, so a UI check against it
 * can only ever agree.
 *
 * The four names this used to match — Admin, System Admin, Primary_Admin, Primary Admin —
 * were all removed when the seven roles became five, so this had been returning false for
 * every real user. Anyone holding one was migrated to Ehs_Director.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role?.trim()) {
    return false;
  }

  const normalized = role.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "ehsdirector";
}
