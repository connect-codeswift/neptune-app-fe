"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useSiteWorkHoursQuery } from "@/hooks/use-incident-kpi-queries";
import { hasSufficientSiteWorkHours } from "@/services/mappers/incident-kpi.mapper";

const SETTINGS_HREF = "/dashboard/settings/incident-rates";

export function SiteWorkHoursMissingBanner() {
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const workHoursQuery = useSiteWorkHoursQuery(isClientReady && hasToken);

  if (!isClientReady || !hasToken || workHoursQuery.isLoading) {
    return null;
  }

  if (hasSufficientSiteWorkHours(workHoursQuery.data?.dataModel)) {
    return null;
  }

  return (
    <div >{""}</div>
  );
}
