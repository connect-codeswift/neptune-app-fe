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

  if (workHoursQuery.isError) {
    return null;
  }

  if (hasSufficientSiteWorkHours(workHoursQuery.data?.dataModel)) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-ehs-border flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 shadow-sm"
    >
      <Icon
        icon="mdi:clock-alert-outline"
        className="mt-0.5 shrink-0 text-lg text-amber-600"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="p" className="text-ehs-darker text-sm leading-relaxed">
          Site work hours are missing, so incident rates for this site
          can&apos;t be calculated.
        </Text>
        <Link
          href={SETTINGS_HREF}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover w-fit text-sm font-semibold transition-colors"
        >
          Add work hours
        </Link>
      </div>
    </div>
  );
}
