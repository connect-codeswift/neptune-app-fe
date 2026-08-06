"use client";

import { useMemo, useState } from "react";
import { SiteSwitcher } from "@/components/SiteSwitcher";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { getAuthContext } from "@/lib/auth-context";

export type OrgSiteSwitcherProps = Readonly<{
  onSiteChange?: (siteId: number | null) => void;
  className?: string;
}>;

/** Site switcher backed by GET /Auth/Org/me (organization name + sites). */
export function OrgSiteSwitcher(props: Readonly<OrgSiteSwitcherProps>) {
  const { onSiteChange, className } = props;
  const { user, sites, isLoading } = useSessionBootstrap();
  const authContext = getAuthContext();
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(
    authContext?.siteId ?? null,
  );

  const switcherSites = useMemo(
    () => sites.map((site) => ({ id: site.id, siteName: site.siteName })),
    [sites],
  );

  if (isLoading || !user.organizationName) {
    return null;
  }

  return (
    <SiteSwitcher
      company={user.organizationName}
      sites={switcherSites}
      selectedSiteId={selectedSiteId}
      className={className}
      onChange={(siteId) => {
        setSelectedSiteId(siteId);
        onSiteChange?.(siteId);
      }}
    />
  );
}
