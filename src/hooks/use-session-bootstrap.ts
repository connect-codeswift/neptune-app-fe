"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { APP_NAV_GROUPS, getVisibleNavGroups } from "@/lib/app-nav";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { getCurrentUser } from "@/lib/current-user";
import { parseActivatedModuleSet } from "@/lib/ehs-modules";
import {
  getCurrentUserPermissions,
} from "@/lib/jwt-permissions";
import { formatJobTitleLabel } from "@/lib/format-job-title";
import { mergePermissionSets } from "@/lib/normalize-session";
import {
  getCachedAccessWindow,
  setCachedAccessWindow,
  shouldShowAccessWindowBanner,
  type AccessWindowState,
} from "@/lib/access-window";
import {
  getOrganizationLimitsState,
  shouldShowOrganizationLimitsBanner,
  type OrganizationLimitsState,
} from "@/lib/organization-limits";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { getOrgSession } from "@/services/session.service";

export const sessionQueryKeys = {
  all: ["session"] as const,
  me: ["session", "org-me"] as const,
};

const SESSION_STALE_TIME_MS = 5 * 60 * 1000;

/** No-op subscribe — access-window cache is written by our own effects. */
const subscribeToNothing = () => () => undefined;

/**
 * sessionStorage cache for the access-window banner.
 * Server snapshot is always null so SSR HTML matches the first client hydrate.
 * {@link getCachedAccessWindow} returns a stable object reference when unchanged.
 */
function useCachedAccessWindow(): AccessWindowState | null {
  return useSyncExternalStore(
    subscribeToNothing,
    getCachedAccessWindow,
    () => null,
  );
}

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
  const cachedAccessWindow = useCachedAccessWindow();
  const authContext = hasToken === true ? getAuthContext() : null;
  const currentUser =
    hasToken === true ?
      getCurrentUser()
    : { userId: 0, siteId: 0, subCompanyId: 0, role: null };

  const sessionQuery = useQuery({
    queryKey: sessionQueryKeys.me,
    queryFn: () => getOrgSession(),
    enabled: hasToken === true,
    staleTime: SESSION_STALE_TIME_MS,
    retry: 1,
  });

  const session = sessionQuery.data;

  const accessWindow = useMemo((): AccessWindowState | null => {
    if (
      session &&
      shouldShowAccessWindowBanner(session.accessExpiresAt)
    ) {
      return {
        accessExpiresAt: session.accessExpiresAt!,
        daysRemaining: session.daysRemaining ?? 0,
      };
    }

    // Avoid reading sessionStorage during SSR/hydration — show cached banner only
    // after we know the user is signed in and Org/me has not resolved yet.
    if (hasToken === true && !sessionQuery.isFetched) {
      return cachedAccessWindow;
    }

    return null;
  }, [
    session,
    cachedAccessWindow,
    hasToken,
    sessionQuery.isFetched,
  ]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (shouldShowAccessWindowBanner(session.accessExpiresAt)) {
      setCachedAccessWindow({
        accessExpiresAt: session.accessExpiresAt!,
        daysRemaining: session.daysRemaining ?? 0,
      });
      return;
    }

    if (session.accessExpiresAt === null) {
      setCachedAccessWindow(null);
    }
  }, [session]);

  const organizationLimits = useMemo((): OrganizationLimitsState | null => {
    if (!session) {
      return null;
    }
    const limits = getOrganizationLimitsState(session);
    return limits && shouldShowOrganizationLimitsBanner(limits) ? limits : null;
  }, [session]);

  const activatedModules = useMemo(
    () => parseActivatedModuleSet(session?.activatedModules),
    [session?.activatedModules],
  );

  // Org/me drives the sidebar from licensed modules only — no JWT permission gate.
  const moduleOnlyGating = Boolean(session?.activatedModules?.trim());

  const permissions = useMemo(() => {
    if (hasToken !== true) {
      return new Set<string>();
    }

    // Previously returned an empty set here, which threw away every permission claim
    // whenever the company had licensed modules — so ticking a page for a role in the admin
    // portal changed nothing in the app. Those claims are what make the Pages tab mean
    // something.
    return mergePermissionSets(
      getCurrentUserPermissions(),
      session?.permissions ?? [],
    );
  }, [
    hasToken,
    moduleOnlyGating,
    session?.permissions,
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
    hasToken === true ?
      session?.fullName?.trim() || getAuthDisplayName()
    : "";
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
      profileUrl: session?.profileUrl ?? null,
      role: role ?? "User",
      /** As stored — null when unset. Forms must use this, never the label below, or saving
       *  an untouched profile would silently turn the role into a job title. */
      jobTitle: session?.jobTitle?.trim() || null,
      /** For display: the job title when there is one, otherwise the prettified role. */
      jobTitleLabel: session?.jobTitle?.trim() || formatJobTitleLabel(role),
      siteName: siteLabel,
      email: session?.email ?? authContext?.email ?? null,
      organizationName: session?.organizationName ?? null,
      organizationId: session?.organizationId ?? authContext?.organizationId ?? null,
    },
    activatedModules,
    permissions,
    moduleOnlyGating,
    accessWindow,
    organizationLimits,
  };
}
