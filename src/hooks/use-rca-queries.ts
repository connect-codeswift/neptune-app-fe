"use client";

import { useQuery } from "@tanstack/react-query";
import { getRcaByIncidentId, getRcaCategories } from "@/services/rca.service";
import {
  EMPTY_RCA_INCIDENT_VIEW,
  mapRcaCategoryDtosToView,
  mapRcaIncidentToView,
  selectHrcaLaneCategories,
  type RcaCategoryViewModel,
  type RcaIncidentViewModel,
} from "@/services/mappers/rca.mapper";

export const rcaQueryKeys = {
  categories: ["rca", "categories"] as const,
  byIncident: (incidentId: number) => ["rca", "incident", incidentId] as const,
};

export type RcaCategoriesViewModel = Readonly<{
  /** All categories returned by the API (seeded + any custom). */
  all: readonly RcaCategoryViewModel[];
  /** Seeded ids 1–5 for the HRCA board lanes. */
  hrcaLanes: readonly RcaCategoryViewModel[];
}>;

export type UseRcaCategoriesQueryOptions = Readonly<{
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

export type UseRcaByIncidentQueryOptions = Readonly<{
  incidentId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads RCA categories via GET /api/v1/rca-categories.
 */
export function useRcaCategoriesQuery(options?: UseRcaCategoriesQueryOptions) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: rcaQueryKeys.categories,
    enabled,
    queryFn: async (): Promise<RcaCategoriesViewModel> => {
      const dtos = await getRcaCategories();
      const all = mapRcaCategoryDtosToView(dtos);

      return {
        all,
        hrcaLanes: selectHrcaLaneCategories(all),
      };
    },
  });
}

/**
 * Loads RCA for an incident via GET /api/v1/incidents/{incidentId}/rca.
 * Also loads categories so five HRCA lanes can be rendered even when dataModel is [].
 */
export function useRcaByIncidentQuery(options: UseRcaByIncidentQueryOptions) {
  const incidentId = options.incidentId;
  const enabled =
    (options.enabled ?? false) && incidentId != null && incidentId > 0;

  return useQuery({
    queryKey: rcaQueryKeys.byIncident(incidentId ?? 0),
    enabled,
    queryFn: async (): Promise<RcaIncidentViewModel> => {
      if (incidentId == null || incidentId <= 0) {
        return EMPTY_RCA_INCIDENT_VIEW;
      }

      const [categories, factors] = await Promise.all([
        getRcaCategories(),
        getRcaByIncidentId(incidentId),
      ]);

      return mapRcaIncidentToView(factors, categories);
    },
  });
}
