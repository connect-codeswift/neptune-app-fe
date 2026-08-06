"use client";

import { useMemo } from "react";
import { Text } from "@/components/Text";
import { HeroKpiCard } from "@/components/incidents/dashboard/HeroKpiCard";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useHeaderKpiQuery, useKpiTargetsQuery } from "@/hooks/use-incident-kpi-queries";
import {
  mapHeaderKpisToHeroMetrics,
  mapKpiTargetsToLookup,
} from "@/services/mappers/incident-kpi.mapper";

function HeroKpiSkeleton() {
  return (
    <IncidentGlassCard className="min-h-[180px]">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24" />
        <Skeleton className="mt-auto h-6 w-full" />
      </div>
    </IncidentGlassCard>
  );
}

export function IncidentKpisHeroRow() {
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

  const headerKpiQuery = useHeaderKpiQuery(isClientReady && hasToken);
  const kpiTargetsQuery = useKpiTargetsQuery(isClientReady && hasToken);

  const targetsLookup = useMemo(
    () => mapKpiTargetsToLookup(kpiTargetsQuery.data?.dataModel),
    [kpiTargetsQuery.data?.dataModel],
  );

  const heroMetrics = useMemo(
    () =>
      mapHeaderKpisToHeroMetrics(headerKpiQuery.data?.dataModel, targetsLookup),
    [headerKpiQuery.data?.dataModel, targetsLookup],
  );

  const showBootLoading = !isClientReady;
  const showQueryLoading = isClientReady && hasToken && headerKpiQuery.isLoading;
  const errorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load incident KPIs."
      : isClientReady && headerKpiQuery.isError
        ? getMutationErrorMessage(
            headerKpiQuery.error,
            "Failed to load dashboard KPIs.",
          )
        : null;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="grid gap-x-[14px] gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        <HeroKpiSkeleton />
        <HeroKpiSkeleton />
        <HeroKpiSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? (
        <Text as="p" className="text-ehs-red text-sm">
          {errorMessage}
        </Text>
      ) : null}

      <div className="grid gap-x-[14px] gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {heroMetrics.map((metric) => (
          <HeroKpiCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
