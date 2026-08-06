"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getHeaderKpi,
  getIncidentDashboardKpis,
  getIncidentListKpis,
  getKpiTargets,
  getSiteWorkHours,
} from "@/services/incident-kpi.service";

export const incidentKpiQueryKeys = {
  all: ["incident-kpis"] as const,
  header: () => [...incidentKpiQueryKeys.all, "header"] as const,
  list: () => [...incidentKpiQueryKeys.all, "list"] as const,
  dashboard: () => [...incidentKpiQueryKeys.all, "dashboard-kpis"] as const,
  targets: () => [...incidentKpiQueryKeys.all, "targets"] as const,
  siteWorkHours: () =>
    [...incidentKpiQueryKeys.all, "site-work-hours"] as const,
};

/** GET /api/Incident/GetHeaderKpi */
export function useHeaderKpiQuery(enabled = true) {
  return useQuery({
    queryKey: incidentKpiQueryKeys.header(),
    queryFn: () => getHeaderKpi(),
    enabled,
  });
}

/** GET /api/Incident/GetIncidentListKpis */
export function useIncidentListKpisQuery(enabled = true) {
  return useQuery({
    queryKey: incidentKpiQueryKeys.list(),
    queryFn: () => getIncidentListKpis(),
    enabled,
  });
}

/** GET /api/Incident/dashboard-kpis */
export function useIncidentDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: incidentKpiQueryKeys.dashboard(),
    queryFn: () => getIncidentDashboardKpis(),
    enabled,
  });
}

/** GET /api/Incident/kpi-targets */
export function useKpiTargetsQuery(enabled = true) {
  return useQuery({
    queryKey: incidentKpiQueryKeys.targets(),
    queryFn: () => getKpiTargets(),
    enabled,
  });
}

/** GET /api/Incident/site-work-hours */
export function useSiteWorkHoursQuery(enabled = true) {
  return useQuery({
    queryKey: incidentKpiQueryKeys.siteWorkHours(),
    queryFn: () => getSiteWorkHours(),
    enabled,
  });
}
