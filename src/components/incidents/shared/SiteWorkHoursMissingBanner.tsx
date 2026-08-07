"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useSiteWorkHoursQuery } from "@/hooks/use-incident-kpi-queries";
import { hasSiteWorkHours } from "@/services/mappers/incident-kpi.mapper";

const SETTINGS_HREF = "/dashboard/settings/incident-rates";

export function SiteWorkHoursMissingBanner() {
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const workHoursQuery = useSiteWorkHoursQuery(isClientReady && hasToken);

  if (!isClientReady || !hasToken || workHoursQuery.isLoading) {
    return null;
  }

  if (hasSiteWorkHours(workHoursQuery.data?.dataModel)) {
    return null;
  }

  return (
    <div className="border-ehs-yellow/30 bg-ehs-yellow/10 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-yellow mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <Text as="p" className="text-ehs-darker text-sm leading-snug">
          Recordable Rate and LTIR need site work hours. Add monthly hours in
          settings to calculate rates per 200,000 hours worked.
        </Text>
      </div>
      <Link
        href={SETTINGS_HREF}
        className="text-ehs-normal-blue shrink-0 text-sm font-semibold hover:underline"
      >
        Open settings
      </Link>
    </div>
  );
}
