"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentKpiQueryKeys } from "@/hooks/use-incident-kpi-queries";
import { saveSiteWorkHours } from "@/services/incident-kpi.service";

export type SaveSiteWorkHoursInput = Readonly<{
  year: number;
  month: number;
  hours: number;
}>;

/** PUT /api/v1/sites/work-hours — creates or updates hours for one month. */
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
