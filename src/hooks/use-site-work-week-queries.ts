"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRecentSiteWorkWeeks,
  getSiteWorkWeek,
} from "@/services/site-work-week.service";

export const siteWorkWeekQueryKeys = {
  all: ["site-work-weeks"] as const,
  week: (date: string | null) =>
    [...siteWorkWeekQueryKeys.all, "week", date ?? "current"] as const,
  recent: (weeks: number) =>
    [...siteWorkWeekQueryKeys.all, "recent", weeks] as const,
};

/** GET /api/v1/sites/work-weeks — pass any date inside the wanted week, or null for this one. */
export function useSiteWorkWeekQuery(date: string | null, enabled = true) {
  return useQuery({
    queryKey: siteWorkWeekQueryKeys.week(date),
    queryFn: () => getSiteWorkWeek(date ?? undefined),
    enabled,
  });
}

/** GET /api/v1/sites/work-weeks/recent */
export function useRecentSiteWorkWeeksQuery(weeks = 6, enabled = true) {
  return useQuery({
    queryKey: siteWorkWeekQueryKeys.recent(weeks),
    queryFn: () => getRecentSiteWorkWeeks(weeks),
    enabled,
  });
}
