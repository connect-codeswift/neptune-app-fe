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
 * Pulls an incident id out of whatever was typed, accepting the form the grid
 * renders (`INC-1`) plus the separator and casing variants people actually type
 * (`inc 1`, `INC#1`, `inc1`). Anything else returns null and the search stays
 * purely free-text.
 *
 * Kept deliberately in step with ParseIncidentReference in IncidentRepository.cs.
 * The local search pass is only correct as a no-op when it accepts everything the
 * server accepts; matching a haystack that held just the hyphenated form meant
 * `inc1` and `INC 1` were dropped here after the server had correctly returned
 * them, which read to the user as id search being broken.
 */
function parseIncidentReference(searchQuery: string): number | null {
  let value = searchQuery.trim();

  if (/^inc/i.test(value)) {
    value = value.slice(3).replace(/^[-\s#]+/, "");
  }

  // Plain digits only, so "+1", "1.0" and "1 2" are not read as ids.
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
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

  // Additive, like the server's id clause: a bare number is a plausible free-text
  // search too ("press 4"), so matching the id must not stop the text match below.
  const reference = parseIncidentReference(searchQuery);
  if (reference !== null && incident.numericId === reference) {
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
