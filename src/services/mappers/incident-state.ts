import type { IncidentState } from "@/components/incidents/list/incident-list-types";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

function normalizeToken(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isClosedToken(value: string): boolean {
  if (!value) {
    return false;
  }

  return value === "closed" || value.includes("close");
}

/**
 * Derives list/detail Open vs Closed from the incident API.
 *
 * After closure submit, GetIncidentById returns `caseDisposition: "Closed"`
 * (literal string). That is the primary backend signal; other fields are fallbacks.
 */
export function deriveIncidentState(incident: IncidentDto): IncidentState {
  const disposition = normalizeToken(incident.caseDisposition);
  if (disposition === "closed" || disposition.includes("close")) {
    return "Closed";
  }

  const apiState = normalizeToken(incident.state);
  if (apiState === "closed") {
    return "Closed";
  }
  if (apiState === "open") {
    return "Open";
  }

  const status = normalizeToken(incident.status);
  if (isClosedToken(status)) {
    return "Closed";
  }

  const closureStatus = normalizeToken(incident.closureStatus);
  if (closureStatus === "closed") {
    return "Closed";
  }

  if (incident.isClosed === true) {
    return "Closed";
  }

  if (incident.isDrop) {
    return "Closed";
  }

  return "Open";
}

export function isIncidentClosed(incident: IncidentDto): boolean {
  return deriveIncidentState(incident) === "Closed";
}
