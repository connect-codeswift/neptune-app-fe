import type { IncidentDto } from "@/dtos/res/incident-response.dto";
import type {
  IncidentRecord,
  IncidentSeverity,
  IncidentStage,
  IncidentState,
} from "@/components/incidents/list/incident-list-types";

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

  const known: IncidentSeverity[] = [
    "Lost Time",
    "Near Miss",
    "First Aid",
    "Recordable",
    "SIA",
    "SIP",
  ];

  const match = known.find(
    (item) => item.toLowerCase() === trimmed.toLowerCase(),
  );

  return match ?? (trimmed as IncidentSeverity);
}

function deriveState(incident: IncidentDto): IncidentState {
  if (incident.isDrop) {
    return "Closed";
  }

  const disposition = incident.caseDisposition?.trim().toLowerCase();
  if (disposition?.includes("close")) {
    return "Closed";
  }

  return "Open";
}

function deriveStage(incident: IncidentDto): IncidentStage {
  if (incident.isDrop) {
    return "Closed";
  }

  const disposition = incident.caseDisposition?.trim();
  if (!disposition) {
    return "New";
  }

  const known: IncidentStage[] = [
    "Open",
    "New",
    "Investigating",
    "Corrective",
    "Closed",
  ];

  const match = known.find(
    (item) => item.toLowerCase() === disposition.toLowerCase(),
  );

  return match ?? "Open";
}

function buildTitle(incident: IncidentDto): string {
  const description = incident.description?.trim();
  if (description) {
    const firstSentence = description.split(/[.?\n]/)[0]?.trim();
    if (firstSentence) {
      return firstSentence.length > 80
        ? `${firstSentence.slice(0, 77)}...`
        : firstSentence;
    }
  }

  const location = incident.location?.trim() || incident.site?.trim();
  if (location) {
    return `Incident at ${location}`;
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

function buildReporter(incident: IncidentDto): string {
  const fromPeople = incident.people?.find((person) => person.name?.trim())
    ?.name;
  if (fromPeople?.trim()) {
    return fromPeople.trim();
  }

  return incident.incidentReporterEmail?.trim() || "—";
}

function buildInjury(incident: IncidentDto): string {
  const fromPeople = incident.people?.find((person) => person.injuryLevel)
    ?.injuryLevel;
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

export function mapIncidentDtoToListRecord(
  incident: IncidentDto,
): IncidentRecord {
  const numericId = incident.id ?? 0;
  const description = incident.description?.trim() || "No description provided.";

  return {
    id: numericId > 0 ? `INC-${String(numericId)}` : "INC-—",
    numericId,
    title: buildTitle(incident),
    description,
    site: buildSite(incident),
    severity: normalizeSeverity(incident.severity),
    stage: deriveStage(incident),
    state: deriveState(incident),
    reportedAt: formatDateTime(
      incident.incidentReportedAt ?? incident.incidentAt,
    ),
    reporter: buildReporter(incident),
    assignee: "—",
    injury: buildInjury(incident),
    summary: description,
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
