"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getIncidentTrends,
  getMainDashboardKpis,
  getMyActions,
} from "@/services/ehs-command-center.service";

export const dashboardQueryKeys = {
  mainKpis: ["dashboard", "main-kpis"] as const,
  incidentTrends: ["dashboard", "incident-trends"] as const,
  myActions: ["dashboard", "my-actions"] as const,
};

/** GET /api/EHSCommandCenter/GetMainDashboardKpis */
export function useMainDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.mainKpis,
    queryFn: () => getMainDashboardKpis(),
    enabled,
  });
}

/** GET /api/EHSCommandCenter/GetIncidentTrends */
export function useIncidentTrendsQuery(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.incidentTrends,
    queryFn: () => getIncidentTrends(),
    enabled,
  });
}

/** GET /api/EHSCommandCenter/GetMyActions */
export function useMyActionsQuery(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.myActions,
    queryFn: () => getMyActions(),
    enabled,
  });
}
