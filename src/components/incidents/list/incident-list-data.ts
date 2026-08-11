import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import type { DateRange } from "@/lib/date-range";
import { isDateWithinRange } from "@/lib/date-range";
import { startOfDay } from "@/components/incidents/report/shared/report-date-time";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";
import { isIncidentClosed } from "@/services/mappers/incident-state";

export const STATE_FILTERS = ["All", "Open", "Closed"] as const;
export const SEVERITY_FILTERS = [
  "All",
  "First Aid",
  "Recordable",
  "Lost Time",
  "SIA",
  "SIP",
] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const OPEN_TARGET = 10;
const MTTC_TARGET_DAYS = 5;
const RIR_TARGET = 2.5;
const LTI_BEST_TARGET_DAYS = 112;
/** Assumed annual exposure hours for RIR = (N × 200,000) / EH. */
const ASSUMED_EXPOSURE_HOURS = 200_000;

function isClosedIncident(incident: IncidentDto): boolean {
  return isIncidentClosed(incident);
}

/**
 * Translates the "Severity" segmented filter into the `severity` token for the
 * server-side filter on GetAllIncidents.
 *
 * The server matches case-insensitive Contains, so we send the shortest
 * semantic token: "recordable" covers both stored vocabularies
 * ("OSHA Recordable" and "Recordable") where an exact label would miss one.
 *
 * Returns `undefined` when nothing should be sent.
 */
export function toApiSeverityFilter(
  severityFilter: string,
): string | undefined {
  if (severityFilter === "All") {
    return undefined;
  }

  return severityFilter === "Recordable" ? "recordable" : severityFilter;
}

/** Severity filter: "Recordable" includes OSHA Recordable (flag and/or label). */
export function incidentMatchesSeverityFilter(
  incident: IncidentRecord,
  severityFilter: string,
): boolean {
  if (severityFilter === "All") {
    return true;
  }

  if (severityFilter === "Recordable") {
    return (
      incident.isOshaRecordable ||
      incident.severity === "Recordable" ||
      incident.severity.toLowerCase().includes("recordable")
    );
  }

  return incident.severity === severityFilter;
}

/**
 * Case-insensitive match across the incident's searchable fields.
 *
 * This haystack is the client half of a cross-repo contract: the server-side
 * search in GetAllIncidents (IncidentRepository.cs) covers every one of these
 * fields' source columns, so nothing the client could match is ever dropped
 * server-side before pagination. Fields intentionally NOT searched here:
 * state (derived label with a dedicated segmented filter), reportedAt
 * (a formatted date string with no server-representable equivalent) and
 * assignee (always "—").
 */
export function incidentMatchesSearch(
  incident: IncidentRecord,
  searchQuery: string,
): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    incident.id,
    String(incident.numericId),
    incident.title,
    incident.description,
    incident.site,
    incident.severity,
    incident.reporter,
    incident.injury,
    incident.summary,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function incidentMatchesDateRange(
  incident: IncidentRecord,
  range: DateRange,
): boolean {
  if (!incident.incidentAt?.trim()) {
    return true;
  }

  const date = parseIncidentDate(incident.incidentAt);
  if (!date) {
    return true;
  }

  return isDateWithinRange(startOfDay(date), range);
}

function parseIncidentDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY);
}

function formatTrend(delta: number, digits = 0): string {
  const value = digits > 0 ? Number(delta.toFixed(digits)) : Math.round(delta);

  if (Object.is(value, -0) || value === 0) {
    return "0";
  }

  return value > 0 ? `+${String(value)}` : String(value);
}

function buildSparklineToward(
  endValue: number,
  options: Readonly<{ points?: number; rising?: boolean }> = {},
): number[] {
  const points = options.points ?? 7;
  const rising = options.rising ?? false;
  const startValue = rising
    ? Math.max(0, endValue * 0.45)
    : Math.max(endValue * 1.35, endValue + 1);

  const series: number[] = [];
  for (let index = 0; index < points; index += 1) {
    const t = points === 1 ? 1 : index / (points - 1);
    const eased = t * t * (3 - 2 * t);
    series.push(
      Number((startValue + (endValue - startValue) * eased).toFixed(2)),
    );
  }

  series[points - 1] = Number(endValue.toFixed(2));
  return series;
}

function isLostTimeIncident(incident: IncidentDto): boolean {
  const severity = incident.severity?.trim().toLowerCase() ?? "";
  return (
    severity.includes("lost time") ||
    severity === "lti" ||
    severity.includes("lost-time")
  );
}

/**
 * Builds the four Figma list KPI cards from the loaded incident page.
 * Metrics are derived from API incidents (no separate KPI endpoint yet).
 */
