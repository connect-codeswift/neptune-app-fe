import type { IncidentState } from "@/components/incidents/list/incident-list-types";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

function normalizeToken(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

/**
 * Derives list/detail Open vs Closed from the incident API.
 *
 * `stage` is the only lifecycle value the backend emits — it is computed in SQL
 * from the closure record (`IsDraft = false` + `ClosedAt`) and linked CAPAs, so
 * it is the same value the grid filters on and cannot drift from the data.
 *
 * Nothing else on the payload says "closed". In particular `caseDisposition` is
 * a First Aid medical answer whose options include the words "Case closed",
 * and reading it here marked first-aid reports Closed at intake while genuinely
 * closed incidents still read Open. The UI only speaks Open/Closed, so the
 * three pre-closure stages all collapse to Open.
 */
export function deriveIncidentState(incident: IncidentDto): IncidentState {
  if (normalizeToken(incident.stage) === "closed") {
    return "Closed";
  }

  // A dropped incident is soft-deleted, not open work — keep it out of the
  // Open bucket as before.
  if (incident.isDrop) {
    return "Closed";
  }

  return "Open";
}

export function isIncidentClosed(incident: IncidentDto): boolean {
  return deriveIncidentState(incident) === "Closed";
}
