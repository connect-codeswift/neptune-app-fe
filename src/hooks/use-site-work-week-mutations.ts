"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SaveSiteWorkWeekRequestDto } from "@/dtos/req/site-work-week-request.dto";
import { incidentKpiQueryKeys } from "@/hooks/use-incident-kpi-queries";
import { siteWorkWeekQueryKeys } from "@/hooks/use-site-work-week-queries";
import { saveSiteWorkWeek } from "@/services/site-work-week.service";

/**
 * PUT /api/v1/sites/work-weeks — creates or replaces one week's shift pattern.
 *
 * Invalidates the incident KPIs as well as the week itself: saving recalculates that month's
 * hours, which is the denominator under RIR and LTIR, so the rate tiles go stale immediately.
 */
export function useSaveSiteWorkWeekMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveSiteWorkWeekRequestDto) => saveSiteWorkWeek(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: siteWorkWeekQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: incidentKpiQueryKeys.all }),
      ]);
    },
  });
}
