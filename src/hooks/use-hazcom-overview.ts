"use client";

import { useMemo } from "react";
import type { HazcomChemical } from "@/components/hazcom/shared/hazcom-types";
import {
  useChemicalsListQuery,
  useSdsListQuery,
  useTrainingLogsQuery,
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
 * The figures behind the HazCom overview, derived from the module's real list
 * endpoints.
 *
 * There is no HazCom summary endpoint. Everything this returns is counted from
 * rows the API actually served; anything the API cannot answer — per-employee
 * training compliance, generic compliance deadlines — is absent here on
 * purpose, and the panels that used to show it say it is unavailable instead of
 * filling in a number.
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
    isSampled:
      chemicalsQuery.totalRecords > chemicalsQuery.items.length ||
      sdsQuery.totalRecords > sdsQuery.items.length,
    isLoading:
      chemicalsQuery.isLoading || sdsQuery.isLoading || trainingQuery.isLoading,
    // Whichever list failed first — the panels degrade together, so one message
    // is enough.
    errorMessage:
      chemicalsQuery.errorMessage ??
      sdsQuery.errorMessage ??
      trainingQuery.errorMessage,
    refetch: () => {
      chemicalsQuery.refetch();
      sdsQuery.refetch();
      trainingQuery.refetch();
    },
  };
}
