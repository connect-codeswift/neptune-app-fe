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
function getPermissionsFromClaims(
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
function getPermissionsFromToken(token?: string | null): Set<string> {
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

/** Admin roles bypass permission checks in the UI (backend does the same). */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role?.trim()) {
    return false;
  }

  const normalized = role.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    normalized === "admin" ||
    normalized === "system admin" ||
    normalized === "primary_admin" ||
    normalized === "primary admin"
  );
}
