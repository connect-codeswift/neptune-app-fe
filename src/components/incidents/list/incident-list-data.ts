import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import type { DateRange } from "@/lib/date-range";
import { isDateWithinRange } from "@/lib/date-range";
import { startOfDay } from "@/lib/date-time-field";

export const STATE_FILTERS = ["All", "Open", "Closed"] as const;
export const SEVERITY_FILTERS = [
  "All",
  "First Aid",
  "Recordable",
  "Lost Time",
  "SIA",
  "SIP",
] as const;

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
