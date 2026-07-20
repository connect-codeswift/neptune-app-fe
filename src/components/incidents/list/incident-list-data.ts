import type { KpiMetricCardProps } from "@/components/KpiMetricCard";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";

export const STATE_FILTERS = ["All", "Open", "Closed"] as const;
export const STAGE_FILTERS = [
  "All",
  "New",
  "Investigating",
  "Corrective",
  "Closed",
] as const;
export const SEVERITY_FILTERS = [
  "All",
  "First Aid",
  "Recordable",
  "Lost Time",
  "SIA",
  "SIP",
] as const;

/** Builds list KPI cards from the current API page (no separate KPI endpoint yet). */
export function buildIncidentListKpis(
  incidents: readonly IncidentRecord[],
): readonly KpiMetricCardProps[] {
  const openCount = incidents.filter(
    (incident) => incident.state === "Open",
  ).length;
  const recordableCount = incidents.filter(
    (incident) => incident.isOshaRecordable,
  ).length;
  const closedCount = incidents.filter(
    (incident) => incident.state === "Closed",
  ).length;
  const total = incidents.length;

  return [
    {
      title: "Open Incidents",
      value: String(openCount),
      unit: "",
      trendValue: total > 0 ? `${String(total)} total` : "0 total",
      trendDirection: "down",
      targetLabel: "From current page",
      chartData: [openCount, openCount, openCount, openCount],
    },
    {
      title: "Closed Incidents",
      value: String(closedCount),
      unit: "",
      trendValue: total > 0 ? `${String(total)} total` : "0 total",
      trendDirection: "down",
      targetLabel: "From current page",
      chartData: [closedCount, closedCount, closedCount, closedCount],
    },
    {
      title: "OSHA Recordable",
      value: String(recordableCount),
      unit: "",
      trendValue: total > 0 ? `${String(total)} total` : "0 total",
      trendDirection: "down",
      targetLabel: "From current page",
      chartData: [recordableCount, recordableCount, recordableCount, recordableCount],
    },
    {
      title: "Loaded Incidents",
      value: String(total),
      unit: "",
      trendValue: "page",
      trendDirection: "up",
      targetLabel: "Current API page",
      chartData: [total, total, total, total],
    },
  ];
}
