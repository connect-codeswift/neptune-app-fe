"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteSwitcher } from "@/components/SiteSwitcher";
import {
  sessionQueryKeys,
  useSessionBootstrap,
} from "@/hooks/use-session-bootstrap";
import { getAuthContext } from "@/lib/auth-context";
import { selectSite } from "@/services/auth.service";

export type OrgSiteSwitcherProps = Readonly<{
  onSiteChange?: (siteId: number | null) => void;
  className?: string;
}>;

/**
 * Site switcher backed by GET /Auth/Org/me (organization name + the caller's sites).
 *
 * Picking a site is a real server round trip, not a client filter: POST /Auth/select-site
 * reissues the session's tokens against the new site, and every site-scoped query in the app
 * resolves its scope from that token. The current selection is therefore read back off the
 * token rather than tracked separately, so the control can never disagree with what the rest
 * of the dashboard is showing.
 */
export function OrgSiteSwitcher(props: Readonly<OrgSiteSwitcherProps>) {
  const { onSiteChange, className } = props;
  const queryClient = useQueryClient();
  const { user, sites, isLoading } = useSessionBootstrap();
  const authContext = getAuthContext();

  const switchSite = useMutation({
    mutationFn: (siteId: number) => selectSite(siteId),
    onSuccess: async (result) => {
      // Every cached response was fetched under the previous site, so none of it is valid
      // here — dropping the lot is cheaper to reason about than listing what was scoped.
      queryClient.clear();
      await queryClient.refetchQueries({ queryKey: sessionQueryKeys.all });

      toast.success(
        result.siteName
          ? `Switched to ${result.siteName}.`
          : "Switched site.",
      );
      onSiteChange?.(result.siteId);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not switch site.",
      );
    },
  });

  const switcherSites = useMemo(
    () => sites.map((site) => ({ id: site.id, siteName: site.siteName })),
    [sites],
  );

  const organizationName =
    user.organizationName ?? authContext?.organizationName ?? null;

  if (isLoading) {
    return null;
  }

  if (!organizationName || switcherSites.length === 0) {
    return null;
  }

  return (
    <SiteSwitcher
      company={organizationName}
      sites={switcherSites}
      selectedSiteId={authContext?.siteId ?? null}
      // A tenant session is always scoped to exactly one site — there is no server-side
      // meaning for "all sites" yet, so offering it would promise something we cannot do.
      allowAllSites={false}
      disabled={switchSite.isPending}
      className={className}
      onChange={(siteId) => {
        if (siteId == null || siteId === authContext?.siteId) {
          return;
        }

        switchSite.mutate(siteId);
      }}
    />
  );
}
