"use client";

import { useMemo } from "react";
import { Text } from "@/components/Text";
import { IndicatorCard } from "@/components/incidents/dashboard/IndicatorCard";
import { InjuryMixCard } from "@/components/incidents/dashboard/InjuryMixCard";
import { RecordableInjuriesChart } from "@/components/incidents/dashboard/RecordableInjuriesChart";
import { RecordablesBySiteCard } from "@/components/incidents/dashboard/RecordablesBySiteCard";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  useIncidentDashboardKpisQuery,
  useKpiTargetsQuery,
} from "@/hooks/use-incident-kpi-queries";
import {
  mapIncidentDashboardKpisToViewModel,
  partitionIndicatorMetrics,
} from "@/services/mappers/incident-dashboard.mapper";

function ChartSkeleton() {
  return (
    <IncidentGlassCard paddingClassName="p-[23px]" className="min-h-[308px]">
      <Skeleton className="mb-4 h-4 w-48" />
      <Skeleton className="h-[188px] w-full" />
    </IncidentGlassCard>
  );
}

function SiteCardSkeleton() {
  return (
    <IncidentGlassCard
      paddingClassName="px-[23px] pt-[23px] pb-6"
      className="flex h-[326px] max-h-[326px] min-h-[326px] flex-col overflow-hidden"
    >
      <Skeleton className="mb-4 h-4 w-40 shrink-0" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full shrink-0" />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

function IndicatorCardSkeleton() {
  return (
    <IncidentGlassCard paddingClassName="p-[17px]" className="min-h-[132px]">
      <Skeleton className="mb-4 h-3 w-24" />
      <Skeleton className="mb-4 h-8 w-16" />
      <Skeleton className="h-6 w-full" />
    </IncidentGlassCard>
  );
}

export function IncidentKpisDashboardSections() {
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const queryEnabled = isClientReady && hasToken;

  const dashboardQuery = useIncidentDashboardKpisQuery(queryEnabled);
  const kpiTargetsQuery = useKpiTargetsQuery(queryEnabled);

  const viewModel = useMemo(
    () =>
      mapIncidentDashboardKpisToViewModel(
        dashboardQuery.data?.dataModel,
        kpiTargetsQuery.data?.dataModel,
      ),
    [dashboardQuery.data?.dataModel, kpiTargetsQuery.data?.dataModel],
  );

  const { gridIndicators, featuredIndicators } = useMemo(
    () => partitionIndicatorMetrics(viewModel.indicators),
    [viewModel.indicators],
  );

  const gridRowPad = (4 - (gridIndicators.length % 4)) % 4;

  const showLoading =
    !isClientReady || (queryEnabled && dashboardQuery.isLoading);
  const errorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load incident dashboard KPIs."
      : isClientReady && dashboardQuery.isError
        ? getMutationErrorMessage(
            dashboardQuery.error,
            "Failed to load incident dashboard KPIs.",
          )
        : null;

  if (showLoading) {
    return (
      <>
        <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
          <ChartSkeleton />
          <SiteCardSkeleton />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 13 }).map((_, index) => (
            <IndicatorCardSkeleton key={index} />
          ))}
          <IncidentGlassCard
            paddingClassName="p-[19px]"
            className="min-h-[216px] sm:col-span-2"
          >
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-[132px] w-full" />
          </IncidentGlassCard>
        </div>
      </>
    );
  }

  return (
    <>
      {errorMessage ? (
        <Text as="p" className="text-ehs-red text-sm">
          {errorMessage}
        </Text>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
        <RecordableInjuriesChart chart={viewModel.recordableChart} />
        <RecordablesBySiteCard sites={viewModel.recordablesBySite} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {gridIndicators.map((metric) => (
          <IndicatorCard key={metric.id} metric={metric} />
        ))}
        {Array.from({ length: gridRowPad }).map((_, index) => (
          <div
            key={`grid-row-pad-${index}`}
            className="hidden xl:block"
            aria-hidden="true"
          />
        ))}
        {featuredIndicators.map((metric) => (
          <IndicatorCard key={metric.id} metric={metric} />
        ))}
        <InjuryMixCard
          className="sm:col-span-2"
          items={viewModel.injuryMix}
          total={viewModel.injuryMixTotal}
        />
      </div>
    </>
  );
}
