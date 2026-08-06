import type { IncidentDto } from "@/dtos/res/incident-response.dto";
import type {
  IncidentRecord,
  IncidentSeverity,
} from "@/components/incidents/list/incident-list-types";
import { deriveIncidentState } from "@/services/mappers/incident-state";

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${String(yyyy)}-${mm}-${dd} ${hh}:${min}`;
}

function normalizeSeverity(value: string | null | undefined): IncidentSeverity {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "Near Miss";
  }

  const lower = trimmed.toLowerCase();

  // Report form stores "OSHA Recordable"; list filter uses "Recordable".
  if (lower.includes("recordable") || lower === "osha") {
    return "Recordable";
  }

  if (
    lower.includes("lost time") ||
    lower === "lti" ||
    lower.includes("lost-time")
  ) {
    return "Lost Time";
  }

  if (lower.includes("first aid") || lower === "first-aid") {
    return "First Aid";
  }

  const known: IncidentSeverity[] = [
    "Lost Time",
    "Near Miss",
    "First Aid",
    "Recordable",
    "SIA",
    "SIP",
  ];

  const match = known.find((item) => item.toLowerCase() === lower);

  return match ?? (trimmed as IncidentSeverity);
}

function capitalizeFirst(text: string | null | undefined): string {
  if (!text) {
    return "";
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function buildTitle(incident: IncidentDto): string {
  const apiTitle = incident.title?.trim();
  if (apiTitle) {
    const truncated =
      apiTitle.length > 80 ? `${apiTitle.slice(0, 77)}...` : apiTitle;
    return capitalizeFirst(truncated);
  }

  const description = incident.description?.trim();
  if (description) {
    const firstSentence = description.split(/[.?\n]/)[0]?.trim();
    if (firstSentence) {
      const truncated =
        firstSentence.length > 80
          ? `${firstSentence.slice(0, 77)}...`
          : firstSentence;
      return capitalizeFirst(truncated);
    }
  }

  const location = incident.location?.trim() || incident.site?.trim();
  if (location) {
    return capitalizeFirst(`Incident at ${location}`);
  }

  return incident.id != null ? `Incident #${String(incident.id)}` : "Incident";
}

function buildSite(incident: IncidentDto): string {
  const site = incident.site?.trim();
  const location = incident.location?.trim();

  if (site && location && site !== location) {
    return `${site} · ${location}`;
  }

  return site || location || "—";
}

/** Display name from an email local-part: `franklin@…` → `Franklin`. */
function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (!local) {
    return "";
  }

  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function buildReporter(incident: IncidentDto): string {
  // Prefer an explicit Reporter role — never the first affected/witness person.
  const fromPeople = incident.people?.find((person) => {
    const role = person.role?.trim().toLowerCase() ?? "";
    return role.includes("reporter") && Boolean(person.name?.trim());
  })?.name;
  if (fromPeople?.trim()) {
    return fromPeople.trim();
  }

  const email = incident.incidentReporterEmail?.trim();
  if (email) {
    return displayNameFromEmail(email) || email;
  }

  return "—";
}

function buildInjury(incident: IncidentDto): string {
  const fromPeople = incident.people?.find(
    (person) => person.injuryLevel,
  )?.injuryLevel;
  if (fromPeople?.trim()) {
    return fromPeople.trim();
  }

  return (
    incident.natureOfInjury?.trim() ||
    incident.initialTreatment?.trim() ||
    incident.severity?.trim() ||
    "—"
  );
}

function toNumericId(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return 0;
}

export function mapIncidentDtoToListRecord(
  incident: IncidentDto,
): IncidentRecord {
  const numericId = toNumericId(incident.id);
  const rawDescription =
    incident.description?.trim() || "No description provided.";
  const description = capitalizeFirst(rawDescription);
  const title = capitalizeFirst(buildTitle(incident));

  return {
    id: numericId > 0 ? `INC-${String(numericId)}` : "INC-—",
    numericId,
    title,
    description,
    site: buildSite(incident),
    severity: normalizeSeverity(incident.severity),
    state: deriveIncidentState(incident),
    reportedAt: formatDateTime(
      incident.incidentReportedAt ?? incident.incidentAt,
    ),
    reporter: buildReporter(incident),
    assignee: "—",
    injury: buildInjury(incident),
    summary: description,
    incidentAt: incident.incidentAt ?? incident.incidentReportedAt ?? null,
    isOshaRecordable: Boolean(incident.isOSHARecordable),
    capas: [],
    timeline: [],
  };
}

export function mapIncidentDtosToListRecords(
  incidents: readonly IncidentDto[],
): IncidentRecord[] {
  return incidents.map(mapIncidentDtoToListRecord);
}
