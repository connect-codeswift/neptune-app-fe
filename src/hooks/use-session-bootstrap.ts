"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { APP_NAV_GROUPS, getVisibleNavGroups } from "@/lib/app-nav";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/current-user";
import { parseActivatedModuleSet } from "@/lib/ehs-modules";
import {
  getCurrentUserPermissions,
} from "@/lib/jwt-permissions";
import { mergePermissionSets } from "@/lib/normalize-session";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { getOrgSession } from "@/services/session.service";

export const sessionQueryKeys = {
  all: ["session"] as const,
  me: ["session", "org-me"] as const,
};

const SESSION_STALE_TIME_MS = 5 * 60 * 1000;

function getUserInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
}

export function useSessionBootstrap() {
  const hasToken = useHasAccessToken();
  const authContext = getAuthContext();
  const currentUser = getCurrentUser();

  const sessionQuery = useQuery({
    queryKey: sessionQueryKeys.me,
    queryFn: () => getOrgSession(),
    enabled: hasToken === true,
    staleTime: SESSION_STALE_TIME_MS,
    retry: 1,
  });

  const session = sessionQuery.data;

  const activatedModules = useMemo(
    () => parseActivatedModuleSet(session?.activatedModules),
    [session?.activatedModules],
  );

  // Org/me drives the sidebar from licensed modules only — no JWT permission gate.
  const moduleOnlyGating = Boolean(session?.activatedModules?.trim());

  const permissions = useMemo(() => {
    if (moduleOnlyGating) {
      return new Set<string>();
    }

    return mergePermissionSets(
      getCurrentUserPermissions(),
      session?.permissions ?? [],
    );
  }, [
    moduleOnlyGating,
    session?.permissions,
    hasToken,
    sessionQuery.dataUpdatedAt,
  ]);

  const role = session?.role ?? currentUser.role;

  const navGroups = useMemo(
    () =>
      getVisibleNavGroups(
        APP_NAV_GROUPS,
        activatedModules,
        permissions,
        role,
        moduleOnlyGating,
      ),
    [activatedModules, permissions, role, moduleOnlyGating],
  );

  const displayName =
    session?.fullName?.trim() || getAuthDisplayName();
  const siteLabel =
    session?.siteName ??
    authContext?.siteName ??
    session?.sites.find((site) => site.id === (session?.siteId ?? authContext?.siteId))
      ?.siteName ??
    null;

  const isUserReady =
    hasToken !== true || sessionQuery.isFetched;

  return {
    navGroups,
    isLoading: hasToken === null || (hasToken === true && sessionQuery.isLoading),
    isUserReady,
    isError: sessionQuery.isError,
    sites: session?.sites ?? [],
    user: {
      displayName,
      initials: getUserInitials(displayName),
      role: role ?? "User",
      siteName: siteLabel,
      email: session?.email ?? authContext?.email ?? null,
      organizationName: session?.organizationName ?? null,
      organizationId: session?.organizationId ?? authContext?.organizationId ?? null,
    },
    activatedModules,
    permissions,
    moduleOnlyGating,
  };
}
