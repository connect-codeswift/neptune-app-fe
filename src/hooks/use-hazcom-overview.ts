"use client";

import { useMemo } from "react";
import type {
  HazcomChemical,
  HazcomTrainingCompliance,
  HazcomUpcomingDeadline,
} from "@/components/hazcom/shared/hazcom-types";
import {
  useChemicalsListQuery,
  useSdsListQuery,
  useTrainingComplianceQuery,
  useTrainingLogsQuery,
  useUpcomingDeadlinesQuery,
} from "@/hooks/use-hazcom-queries";

/**
 * Neither the chemical nor the SDS endpoint aggregates, and neither takes a
 * filter — so the counts below are computed from a page of rows. One large page
 * stands in for the whole set, the same stand-in the label generator's picker
 * makes. When a site holds more rows than this, `isSampled` goes true and the
 * panels say so rather than presenting a partial count as a census.
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
  /** Authoritative — the endpoint's own total, not a row count. */
  totalChemicals: number;
  totalTrainingSessions: number;
  sds: HazcomOverviewSdsCounts;
  recentChemicals: readonly HazcomChemical[];
  upcomingDeadlines: readonly HazcomUpcomingDeadline[];
  /** `null` when the dashboard endpoint has no compliance row. */
  trainingCompliance: HazcomTrainingCompliance | null;
  /** True when either list holds more rows than one page could load. */
  isSampled: boolean;
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
  const sdsQuery = useSdsListQuery({
    pageNumber: 1,
    pageSize: OVERVIEW_PAGE_SIZE,
  });
  const trainingQuery = useTrainingLogsQuery({
    pageNumber: 1,
    pageSize: 1,
  });
  const deadlinesQuery = useUpcomingDeadlinesQuery();
  const complianceQuery = useTrainingComplianceQuery();

  const sds = useMemo<HazcomOverviewSdsCounts>(() => {
    // "Compliant" / "Due Soon" / "Overdue" are derived from each sheet's
    // revision date by the SDS mapper — see hazcom-sds.mapper.
    let compliant = 0;
    let dueSoon = 0;
    let overdue = 0;

    for (const record of sdsQuery.items) {
      if (record.status === "Compliant") compliant += 1;
      else if (record.status === "Due Soon") dueSoon += 1;
      else overdue += 1;
    }

    const missing = chemicalsQuery.items.filter(
      (chemical) => chemical.sdsRecordId === null,
    ).length;

    return { compliant, dueSoon, overdue, missing };
  }, [sdsQuery.items, chemicalsQuery.items]);

  const recentChemicals = useMemo(
    () =>
      [...chemicalsQuery.items]
        .sort(byAddedOnDescending)
        .slice(0, RECENT_ADDITIONS_LIMIT),
    [chemicalsQuery.items],
  );

  return {
    totalChemicals: chemicalsQuery.totalRecords,
    totalTrainingSessions: trainingQuery.totalRecords,
    sds,
    recentChemicals,
    upcomingDeadlines: deadlinesQuery.deadlines,
    trainingCompliance: complianceQuery.compliance,
    isSampled:
      chemicalsQuery.totalRecords > chemicalsQuery.items.length ||
      sdsQuery.totalRecords > sdsQuery.items.length,
    isLoading:
      chemicalsQuery.isLoading ||
      sdsQuery.isLoading ||
      trainingQuery.isLoading ||
      deadlinesQuery.isLoading ||
      complianceQuery.isLoading,
    errorMessage:
      chemicalsQuery.errorMessage ??
      sdsQuery.errorMessage ??
      trainingQuery.errorMessage ??
      deadlinesQuery.errorMessage ??
      complianceQuery.errorMessage,
    refetch: () => {
      chemicalsQuery.refetch();
      sdsQuery.refetch();
      trainingQuery.refetch();
      deadlinesQuery.refetch();
      complianceQuery.refetch();
    },
  };
}
