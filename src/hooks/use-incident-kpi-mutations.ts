"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { KpiMetricKey } from "@/dtos/res/incident-kpi-response.dto";
import { incidentKpiQueryKeys } from "@/hooks/use-incident-kpi-queries";
import { saveKpiTarget, saveSiteWorkHours } from "@/services/incident-kpi.service";
import { normalizeKpiMetricKey } from "@/services/mappers/incident-kpi.mapper";

export type SaveKpiTargetInput = Readonly<{
  metric: KpiMetricKey | string;
  targetValue: number;
}>;

export type SaveSiteWorkHoursInput = Readonly<{
  year: number;
  month: number;
  hours: number;
}>;

/** PUT /api/Incident/kpi-targets — creates or updates one target for the site. */
export function useSaveKpiTargetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveKpiTargetInput) => {
      const metricKey = normalizeKpiMetricKey(input.metric);
      if (!metricKey) {
        throw new Error("Unknown KPI metric.");
      }

      return saveKpiTarget({
        metric: metricKey,
        targetValue: input.targetValue,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentKpiQueryKeys.all,
      });
    },
  });
}

/** PUT /api/Incident/site-work-hours — creates or updates hours for one month. */
export function useSaveSiteWorkHoursMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveSiteWorkHoursInput) => saveSiteWorkHours(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentKpiQueryKeys.all,
      });
    },
  });
}
