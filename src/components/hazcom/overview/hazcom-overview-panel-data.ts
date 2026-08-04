import type { HazcomBadgeTone } from "@/components/hazcom/shared";

/**
 * Site-wide compliance aggregates shown on the Overview dashboard's SDS
 * Status Overview and Training Compliance panels.
 *
 * These are standalone KPIs — the same kind of figure as
 * `HAZCOM_OVERVIEW_STATS` (142 total chemicals, 7 missing SDS, 14 training
 * overdue, 5 SDS expiring soon) — and intentionally do NOT derive from the
 * 6-row `HAZCOM_SDS_RECORDS` / `HAZCOM_TRAINING_SESSIONS` sample tables used
 * elsewhere in the module. Those tables are illustrative row-level samples;
 * they are not a census of the full ~142-chemical population these two
 * panels summarize, so counting their rows would produce numbers with no
 * relationship to the real aggregates the approved design shows.
 */

export type HazcomOverviewPanelRow = Readonly<{
  id: string;
  label: string;
  value: number;
  /** Only "success" (green), "muted" (grey/neutral), and "danger" (red) are used. */
  tone: HazcomBadgeTone;
}>;

export const HAZCOM_SDS_STATUS_ROWS: readonly HazcomOverviewPanelRow[] = [
  {
    id: "compliant",
    label: "Current & Compliant",
    value: 128,
    tone: "success",
  },
  {
    id: "expiring-90",
    label: "Expiring Within 90 Days",
    value: 5,
    tone: "muted",
  },
  { id: "overdue", label: "Overdue / Expired", value: 4, tone: "danger" },
  { id: "missing", label: "Missing SDS", value: 7, tone: "danger" },
];

export const HAZCOM_TRAINING_COMPLIANCE_ROWS: readonly HazcomOverviewPanelRow[] =
  [
    { id: "compliant", label: "Compliant", value: 89, tone: "success" },
    { id: "due-soon", label: "Due Soon", value: 18, tone: "muted" },
    { id: "overdue", label: "Overdue", value: 14, tone: "danger" },
    { id: "never-trained", label: "Never Trained", value: 6, tone: "muted" },
  ];
