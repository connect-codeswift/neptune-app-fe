"use client";

import { useMemo } from "react";
import type {
  HazcomChemical,
  HazcomTrainingCompliance,
  HazcomUpcomingDeadline,
} from "@/components/hazcom/shared/hazcom-types";
import {
  useChemicalsListQuery,
  useDashboardKpisQuery,
  useSdsStatusOverviewQuery,
  useTrainingComplianceQuery,
  useTrainingLogsQuery,
  useUpcomingDeadlinesQuery,
} from "@/hooks/use-hazcom-queries";

/**
 * The "recent additions" strip only needs a page to sort/slice from — it is
 * not a source of truth for any count. The counts themselves come from the
 * dashboard's own aggregation endpoints (`dashboard/kpis`,
 * `dashboard/sds-status`), not from sampling a page of the list endpoints.
 */
const OVERVIEW_PAGE_SIZE = 200;

const RECENT_ADDITIONS_LIMIT = 4;

export type HazcomOverviewSdsCounts = Readonly<{
  compliant: number;
  dueSoon: number;
  overdue: number;
  /** Inventory rows with no SDS record linked. */
  missing: number;
}>;

export type HazcomOverviewState = Readonly<{
  /** Authoritative — the dashboard KPI endpoint's own total, not a row count. */
  totalChemicals: number;
  totalTrainingSessions: number;
  /** Authoritative — from `dashboard/sds-status`, not sampled from a page. */
  sds: HazcomOverviewSdsCounts;
  recentChemicals: readonly HazcomChemical[];
  upcomingDeadlines: readonly HazcomUpcomingDeadline[];
  /** `null` when the dashboard endpoint has no compliance row. */
  trainingCompliance: HazcomTrainingCompliance | null;
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => void;
}>;

/** Newest first. `addedOn` is an ISO date, so it sorts lexicographically. */
function byAddedOnDescending(a: HazcomChemical, b: HazcomChemical): number {
  if (a.addedOn === b.addedOn) return 0;
  return a.addedOn < b.addedOn ? 1 : -1;
}

/**
 * The figures behind the HazCom overview: list totals from the module
 * endpoints, plus the dashboard projections for deadlines and training
 * compliance.
 */
export function useHazcomOverview(): HazcomOverviewState {
  const chemicalsQuery = useChemicalsListQuery({
    pageNumber: 1,
    pageSize: OVERVIEW_PAGE_SIZE,
  });
  const trainingQuery = useTrainingLogsQuery({
    pageNumber: 1,
    pageSize: 1,
  });
  const kpisQuery = useDashboardKpisQuery();
  const sdsStatusQuery = useSdsStatusOverviewQuery();
  const deadlinesQuery = useUpcomingDeadlinesQuery();
  const complianceQuery = useTrainingComplianceQuery();

  const sds = useMemo<HazcomOverviewSdsCounts>(() => {
    const status = sdsStatusQuery.status;

    return {
      compliant: status?.currentAndCompliant ?? 0,
      dueSoon: status?.expiringWithin90Days ?? 0,
      overdue: status?.overdueOrExpired ?? 0,
      missing: status?.missingSds ?? 0,
    };
  }, [sdsStatusQuery.status]);

  const recentChemicals = useMemo(
    () =>
      [...chemicalsQuery.items]
        .sort(byAddedOnDescending)
        .slice(0, RECENT_ADDITIONS_LIMIT),
    [chemicalsQuery.items],
  );

  return {
    totalChemicals:
      kpisQuery.kpis?.totalChemicals ?? chemicalsQuery.totalRecords,
    totalTrainingSessions: trainingQuery.totalRecords,
    sds,
    recentChemicals,
    upcomingDeadlines: deadlinesQuery.deadlines,
    trainingCompliance: complianceQuery.compliance,
    isLoading:
      chemicalsQuery.isLoading ||
      trainingQuery.isLoading ||
      kpisQuery.isLoading ||
      sdsStatusQuery.isLoading ||
      deadlinesQuery.isLoading ||
      complianceQuery.isLoading,
    errorMessage:
      chemicalsQuery.errorMessage ??
      trainingQuery.errorMessage ??
      kpisQuery.errorMessage ??
      sdsStatusQuery.errorMessage ??
      deadlinesQuery.errorMessage ??
      complianceQuery.errorMessage,
    refetch: () => {
      chemicalsQuery.refetch();
      trainingQuery.refetch();
      kpisQuery.refetch();
      sdsStatusQuery.refetch();
      deadlinesQuery.refetch();
      complianceQuery.refetch();
    },
  };
}
