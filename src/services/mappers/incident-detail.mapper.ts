import type {
  AttachmentItem,
  HrcaMeta,
  HrcaRow,
  IncidentDetailInfoItem,
  IncidentDetailResponseAction,
  IncidentRoutingMember,
  MetricRow,
  ResponderMember,
  SignOffRow,
  StatusChecklistRow,
  TimelineEvent,
  WhyChainItem,
  WitnessRow,
} from "@/components/incidents/detail/incident-detail-types";
import { markRootCauses } from "@/components/incidents/detail/investigations/hrca/hrca-data";
import { IMMEDIATE_ACTION_OPTIONS } from "@/components/incidents/report/shared/report-response";
import type { PersonDto, IncidentDto } from "@/dtos/res/incident-response.dto";
import {
  fileNameFromAttachmentUrl,
  guessAttachmentKind,
  uploadedAtFromAttachmentUrl,
} from "@/lib/attachment-url";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { mapIncidentDtoToListRecord } from "@/services/mappers/incident-list.mapper";

export type IncidentInvestigationView = Readonly<{
  whyChain: readonly WhyChainItem[];
  statusSteps: readonly StatusChecklistRow[];
  signoffs: readonly SignOffRow[];
  statusLabel: "Not started" | "In progress" | "Complete";
  ledBy: string;
  methodLine: string;
  hrcaMeta: HrcaMeta;
  hrcaRows: readonly HrcaRow[];
}>;

/** Used when cached detail predates the investigation mapping. */
export const EMPTY_INCIDENT_INVESTIGATION: IncidentInvestigationView = {
  whyChain: [],
  statusSteps: [
    { label: "Evidence collected", completed: false },
    { label: "Witnesses interviewed", completed: false },
    { label: "Root cause identified", completed: false },
    { label: "CAPA defined", completed: false },
    { label: "Manager sign-off", completed: false },
    { label: "Closed-out", completed: false },
  ],
  signoffs: [],
  statusLabel: "Not started",
  ledBy: "Unassigned",
  methodLine: "Method: 5 Whys · Linked to HRCA worksheet",
  hrcaMeta: {
    reportType: "Incident",
    date: "—",
    injury: "—",
    description: "No incident description recorded.",
  },
  hrcaRows: [],
};

export type IncidentDetailViewModel = Readonly<{
  displayId: string;
  numericId: number;
  title: string;
  summaryText: string;
  infoItems: readonly IncidentDetailInfoItem[];
  responseActions: readonly IncidentDetailResponseAction[];
  responseNotes: string;
  affectedName: string;
  affectedRole: string;
  affectedEmpId: string;
  affectedInitials: string;
  affectedInjuryLabel: string;
  bodyPart: string;
  treatment: string;
  daysAway: string | number;
  responders: readonly ResponderMember[];
  witnesses: readonly WitnessRow[];
  attachments: readonly AttachmentItem[];
  timelineEvents: readonly TimelineEvent[];
  responseMetrics: readonly MetricRow[];
  investigation: IncidentInvestigationView;
  routingMembers: readonly IncidentRoutingMember[];
  severity: string;
  state: string;
  site: string;
  reportedAt: string;
  reporter: string;
  isClosed: boolean;
}>;

function formatDateTime(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${String(yyyy)}-${mm}-${dd} ${hh}:${min}`;
}

function yesNo(value: boolean | null | undefined): string {
  if (value == null) {
    return "—";
  }
  return value ? "Yes" : "No";
}

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

/** Backend placeholders for First Aid–only fields on non–First Aid creates. */
function isNaPlaceholder(value: string | null | undefined): boolean {
  return value?.trim().toLowerCase() === "n/a";
}

function isFirstAidSeverity(severity: string | null | undefined): boolean {
  const lower = severity?.trim().toLowerCase() ?? "";
  return lower.includes("first aid") || lower === "first-aid";
}

/**
 * First Aid Step 2 fields that are auto-filled with N/A (or unused defaults)
 * when severity is not First Aid. Hide these on the detail page for other severities.
 */
const FIRST_AID_ONLY_INFO_KEYS = new Set([
  "whatTreatmentWasGiven",
  "treatmentProvidedBy",
  "treatmentLocation",
  "isFitForFullDuty",
  "furtherMedicalRecommendations",
]);

function meaningfulText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || isNaPlaceholder(trimmed)) {
    return null;
  }
  return trimmed;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * Avatar text for the affected person.
 *
 * Intake sometimes records only an employee number and stores it in the name
 * slot, so `initialsFromName` treated it as a one-word name and sliced it to
 * two characters — "9005" rendered as "90", which means nothing. A value
 * carrying no letters is an identifier, so show it whole.
 */
function affectedAvatarText(name: string): string {
  if (!name) {
    return "—";
  }
  if (!/\p{L}/u.test(name)) {
    return name;
  }
  return initialsFromName(name);
}

function isWitness(person: PersonDto): boolean {
  const role = person.role?.trim().toLowerCase() ?? "";
  return role.includes("witness");
}

function isReporterPerson(person: PersonDto): boolean {
  const role = person.role?.trim().toLowerCase() ?? "";
  return role.includes("reporter");
}

function isAffected(person: PersonDto): boolean {
  const role = person.role?.trim().toLowerCase() ?? "";
  return role.includes("affected");
}

/** Resolve affected person without mistaking a witness/reporter for the injured party. */
function resolveAffectedPerson(incident: IncidentDto): PersonDto | null {
  const people = incident.people ?? [];
  const byRole = people.find(isAffected);
  if (byRole?.name?.trim()) {
    return byRole;
  }

  const nonRouting = people.find(
    (person) =>
      Boolean(person.name?.trim()) &&
      !isWitness(person) &&
      !isReporterPerson(person),
  );
  if (nonRouting?.name?.trim()) {
    return nonRouting;
  }

  const affectedId = incident.affectedPersonId?.trim();
  if (affectedId) {
    return {
      name: affectedId,
      role: "Affected person",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    };
  }

  return null;
}

function parseResponseActions(
  actionTaken: string | null | undefined,
): readonly IncidentDetailResponseAction[] {
  const text = actionTaken?.toLowerCase() ?? "";

  return IMMEDIATE_ACTION_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    completed: text.includes(option.label.toLowerCase()),
  }));
}

function mapImagesToAttachments(
  images: string[] | null | undefined,
  addedBy: string,
): readonly AttachmentItem[] {
  if (!images?.length) {
    return [];
  }

  return images
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .map((url, index) => {
      const kind = guessAttachmentKind(url);
      const name = fileNameFromAttachmentUrl(url, index);
      const uploadedAt = uploadedAtFromAttachmentUrl(url);

      return {
        id: `att-${String(index)}`,
        name,
        description:
          kind === "image" ? "Photo" : kind === "video" ? "Video" : "Document",
        // Size is filled client-side via HEAD/Range on the file URL.
        sizeLabel: "—",
        bytes: 0,
        addedBy,
        // Prefer Cloudinary version timestamp; Last-Modified filled client-side if missing.
        time: formatShortDateTime(uploadedAt),
        secureUrl: url,
        kind,
      };
    });
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Display like `Apr 24 · 09:12` for timeline rows. */
function formatTimelineTime(date: Date | null): string {
  if (!date) {
    return "—";
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate());
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day} · ${hh}:${min}`;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  if (totalMinutes < 60) {
    return `${String(totalMinutes)} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) {
    return minutes > 0
      ? `${String(hours)}h ${String(minutes)}m`
      : `${String(hours)}h`;
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0
    ? `${String(days)}d ${String(remHours)}h`
    : `${String(days)}d`;
}

type TimedTimelineEvent = Readonly<{
  sortAt: number;
  event: TimelineEvent;
}>;

function systemActor(): Pick<
  TimelineEvent,
  "actorName" | "actorInitials" | "actorRole"
> {
  return {
    actorName: "System",
    actorInitials: "SYS",
    actorRole: "Record",
  };
}

function actorFromName(
  name: string,
  role?: string,
): Pick<TimelineEvent, "actorName" | "actorInitials" | "actorRole"> {
  const trimmed = name.trim() || "Unknown";
  return {
    actorName: trimmed,
    actorInitials: initialsFromName(trimmed),
    actorRole: role,
  };
}

/**
 * Builds a chronological activity timeline from GetIncidentById fields
 * (no dedicated timeline API yet).
 */
function buildTimelineEvents(
  incident: IncidentDto,
  listMeta: Readonly<{
    severity: string;
    reporter: string;
    site: string;
    isClosed: boolean;
  }>,
): readonly TimelineEvent[] {
  const occurredAt = parseDate(incident.incidentAt);
  const reportedAt =
    parseDate(incident.incidentReportedAt) ?? occurredAt ?? new Date();
  const people = incident.people ?? [];
  const affected = resolveAffectedPerson(incident);
  const witnesses = people.filter(isWitness);
  const images = (incident.images ?? []).filter((url) => Boolean(url?.trim()));
  const reporterName =
    listMeta.reporter !== "—"
      ? listMeta.reporter
      : (incident.incidentReporterEmail?.trim() ?? "Reporter");

  const entries: TimedTimelineEvent[] = [];
  let seq = 0;
  const push = (
    at: Date | null,
    partial: Omit<TimelineEvent, "id" | "time"> & { id?: string },
  ) => {
    const sortAt = (at?.getTime() ?? reportedAt.getTime()) + seq;
    seq += 1;
    entries.push({
      sortAt,
      event: {
        id: partial.id ?? `ev-${String(entries.length + 1)}`,
        title: partial.title,
        description: partial.description,
        time: formatTimelineTime(at),
        actorName: partial.actorName,
        actorInitials: partial.actorInitials,
        actorRole: partial.actorRole,
        icon: partial.icon,
      },
    });
  };

  if (occurredAt) {
    push(occurredAt, {
      title: "Incident occurred",
      description:
        [
          listMeta.site !== "—" ? `Location: ${listMeta.site}` : null,
          incident.description?.trim()
            ? incident.description.trim().slice(0, 160)
            : null,
        ]
          .filter(Boolean)
          .join(" — ") || "Incident time recorded.",
      icon: "mdi:alert-outline",
      ...systemActor(),
    });
  }

  push(reportedAt, {
    title: "Incident reported",
    description: [
      `Severity: ${listMeta.severity}`,
      incident.incidentReporterEmail?.trim()
        ? `Email: ${incident.incidentReporterEmail.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    icon: "mdi:file-document-outline",
    ...actorFromName(reporterName, "Reporter"),
  });

  if (images.length > 0) {
    push(reportedAt, {
      title: "Attachments added",
      description: `${String(images.length)} file${images.length === 1 ? "" : "s"} attached to the report.`,
      icon: "mdi:image-outline",
      ...actorFromName(reporterName, "Reporter"),
    });
  }

  if (affected?.name?.trim()) {
    const injuryBits = [
      affected.injuryLevel?.trim(),
      affected.bodyPartAffected?.trim() || incident.injuredBodyPart?.trim(),
    ].filter(Boolean);
    push(reportedAt, {
      title: "Affected person logged",
      description:
        injuryBits.length > 0
          ? injuryBits.join(" · ")
          : (affected.injuryDescription?.trim() ??
            "Person recorded on the report."),
      icon: "mdi:account-outline",
      ...actorFromName(
        affected.name.trim(),
        affected.role?.trim() || "Affected",
      ),
    });
  }

  for (const witness of witnesses) {
    const name = witness.name?.trim();
    if (!name) continue;
    push(reportedAt, {
      title: "Witness logged",
      description:
        witness.injuryDescription?.trim() || "Witness recorded on the report.",
      icon: "mdi:account-voice",
      ...actorFromName(name, witness.role?.trim() || "Witness"),
    });
  }

  const actionText = incident.actionTaken?.toLowerCase() ?? "";
  for (const option of IMMEDIATE_ACTION_OPTIONS) {
    if (!actionText.includes(option.label.toLowerCase())) continue;
    push(reportedAt, {
      title: option.label,
      description: "Immediate response action recorded.",
      icon: "mdi:check-circle-outline",
      ...actorFromName(reporterName, "Response"),
    });
  }

  const treatmentGiven = meaningfulText(incident.whatTreatmentWasGiven);
  if (treatmentGiven) {
    const treatmentBy = meaningfulText(incident.treatmentProvidedBy);
    const treatmentAt = meaningfulText(incident.treatmentLocation);
    push(reportedAt, {
      title: "Treatment recorded",
      description: [
        treatmentGiven,
        treatmentBy ? `By ${treatmentBy}` : null,
        treatmentAt ? `at ${treatmentAt}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      icon: "mdi:medical-bag",
      ...actorFromName(treatmentBy || reporterName, "Treatment"),
    });
  }

  if (incident.isOSHARecordable) {
    push(reportedAt, {
      title: "Marked OSHA recordable",
      description: incident.isOSHANotificationRequired
        ? "OSHA notification required."
        : "Classified as OSHA recordable.",
      icon: "mdi:shield-alert-outline",
      ...systemActor(),
    });
  }

  if (incident.isEmergencyServiceCalled) {
    push(reportedAt, {
      title: "Emergency service called",
      description: "Emergency response flagged on the report.",
      icon: "mdi:ambulance",
      ...systemActor(),
    });
  }

  if (incident.otherNotes?.trim()) {
    push(reportedAt, {
      title: "Notes recorded",
      description: incident.otherNotes.trim().slice(0, 200),
      icon: "mdi:note-text-outline",
      ...actorFromName(reporterName, "Notes"),
    });
  }

  const disposition = meaningfulText(incident.caseDisposition);
  if (disposition) {
    push(reportedAt, {
      title: listMeta.isClosed ? "Incident closed" : "Case disposition updated",
      description: `Disposition: ${disposition}`,
      icon: listMeta.isClosed
        ? "mdi:lock-check-outline"
        : "mdi:clipboard-check-outline",
      ...systemActor(),
    });
  }

  return entries
    .sort((a, b) => a.sortAt - b.sortAt)
    .map((entry) => entry.event);
}

function buildResponseMetrics(
  incident: IncidentDto,
  options: Readonly<{
    isClosed: boolean;
    attachmentCount: number;
    completedActionCount: number;
  }>,
): readonly MetricRow[] {
  const occurredAt = parseDate(incident.incidentAt);
  const reportedAt = parseDate(incident.incidentReportedAt);
  const now = new Date();
  const metrics: MetricRow[] = [];

  if (occurredAt && reportedAt) {
    metrics.push({
      label: "Time to report",
      value: formatDuration(reportedAt.getTime() - occurredAt.getTime()),
    });
  }

  const openStart = reportedAt ?? occurredAt;
  if (openStart) {
    metrics.push({
      label: options.isClosed ? "Time open (to now)" : "Open duration",
      value: formatDuration(now.getTime() - openStart.getTime()),
    });
  }

  metrics.push({
    label: "Attachments",
    value: String(options.attachmentCount),
  });
  metrics.push({
    label: "Actions completed",
    value: `${String(options.completedActionCount)} / ${String(IMMEDIATE_ACTION_OPTIONS.length)}`,
  });

  return metrics;
}

function truncateText(value: string, max = 180): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatHrcaDate(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) {
    return "—";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Builds a 5-Why style chain from recorded incident fields
 * (no dedicated investigation API yet).
 */
function buildWhyChain(incident: IncidentDto): readonly WhyChainItem[] {
  const facts = [
    incident.description?.trim(),
    incident.mechanismOfInjury?.trim()
      ? `Mechanism: ${incident.mechanismOfInjury.trim()}`
      : null,
    incident.natureOfInjury?.trim()
      ? `Nature of injury: ${incident.natureOfInjury.trim()}`
      : null,
    incident.objectInvolved?.trim()
      ? `Object involved: ${incident.objectInvolved.trim()}`
      : null,
    incident.injuredBodyPart?.trim()
      ? `Body part affected: ${incident.injuredBodyPart.trim()}`
      : null,
    incident.actionTaken?.trim()
      ? `Actions taken: ${truncateText(incident.actionTaken, 140)}`
      : null,
    incident.otherNotes?.trim()
      ? `Notes: ${truncateText(incident.otherNotes, 140)}`
      : null,
  ].filter((value): value is string => Boolean(value));

  if (facts.length === 0) {
    return [];
  }

  // Cap at 5 steps; last recorded fact becomes the provisional root cause.
  const limited = facts.slice(0, 5);

  return limited.map((text, index) => {
    const step = index + 1;
    const isRootCause = index === limited.length - 1 && limited.length > 1;
    return {
      step,
      label: isRootCause ? "ROOT CAUSE" : `WHY ${String(step)}`,
      text: truncateText(text),
      isRootCause,
    };
  });
}

function buildInvestigationStatusSteps(
  incident: IncidentDto,
  options: Readonly<{
    attachmentCount: number;
    witnessCount: number;
    isClosed: boolean;
    whyChainLength: number;
  }>,
): readonly StatusChecklistRow[] {
  const hasRootSignals = Boolean(
    incident.mechanismOfInjury?.trim() ||
    incident.natureOfInjury?.trim() ||
    incident.objectInvolved?.trim() ||
    options.whyChainLength > 1,
  );
  const hasCapaSignal = Boolean(
    incident.otherNotes?.trim() ||
    incident.feedback?.trim() ||
    incident.actionTaken?.trim(),
  );

  return [
    {
      label: "Evidence collected",
      completed: options.attachmentCount > 0,
    },
    {
      label: "Witnesses interviewed",
      completed: options.witnessCount > 0,
    },
    {
      label: "Root cause identified",
      completed: hasRootSignals,
    },
    {
      label: "CAPA defined",
      completed: hasCapaSignal,
    },
    {
      label: "Manager sign-off",
      completed: options.isClosed,
    },
    {
      label: "Closed-out",
      completed: options.isClosed,
    },
  ];
}

function buildSignoffs(
  options: Readonly<{
    reporter: string;
    isClosed: boolean;
  }>,
): readonly SignOffRow[] {
  const reporterName = options.reporter !== "—" ? options.reporter : "Reporter";

  return [
    {
      name: reporterName,
      role: "Reporter",
      initials: initialsFromName(reporterName),
      badgeLabel: "Submitted",
      badgeTone: "green",
    },
    {
      name: options.isClosed ? "Case closed" : "Pending approver",
      role: options.isClosed ? "Disposition" : "EHS / Manager",
      initials: options.isClosed ? "OK" : "PA",
      badgeLabel: options.isClosed ? "Signed" : "Awaiting",
      badgeTone: options.isClosed ? "green" : "gray",
    },
  ];
}

function buildHrcaMeta(
  incident: IncidentDto,
  options: Readonly<{
    severity: string;
    summaryText: string;
    bodyPart: string;
    injuryLabel: string;
  }>,
): HrcaMeta {
  const injury =
    [
      options.injuryLabel !== "—" ? options.injuryLabel : null,
      options.bodyPart !== "—" ? options.bodyPart : null,
    ]
      .filter(Boolean)
      .join(" · ") || options.severity;

  return {
    reportType: options.severity || "Incident",
    date: formatHrcaDate(incident.incidentAt ?? incident.incidentReportedAt),
    injury,
    description:
      options.summaryText.trim() || "No incident description recorded.",
  };
}

function buildHrcaRows(incident: IncidentDto): readonly HrcaRow[] {
  const factorParts = [
    incident.mechanismOfInjury?.trim(),
    incident.objectInvolved?.trim()
      ? `Object: ${incident.objectInvolved.trim()}`
      : null,
  ].filter((value): value is string => Boolean(value));

  if (factorParts.length === 0 && !incident.natureOfInjury?.trim()) {
    return [];
  }

  const whys = markRootCauses(
    [
      incident.mechanismOfInjury?.trim(),
      incident.natureOfInjury?.trim(),
      incident.objectInvolved?.trim(),
      incident.otherNotes?.trim(),
    ]
      .filter((value): value is string => Boolean(value))
      .slice(0, 5)
      .map((text, index) => ({
        num: index + 1,
        text: truncateText(text, 120),
      })),
  );

  const treatmentForHrca = meaningfulText(incident.whatTreatmentWasGiven);
  const actions = [
    incident.actionTaken?.trim()
      ? truncateText(incident.actionTaken, 120)
      : null,
    treatmentForHrca ? `Treatment: ${treatmentForHrca}` : null,
  ].filter((value): value is string => Boolean(value));

  return [
    {
      id: "recorded-factors",
      categoryId: 0,
      category: "Recorded factors",
      accent: "#0891a6",
      contributingFactorId: null,
      contributingFactor:
        factorParts.join(" · ") ||
        incident.natureOfInjury?.trim() ||
        "Contributing factor not yet defined.",
      whys:
        whys.length > 0
          ? whys
          : markRootCauses([
              {
                num: 1,
                text: "Click to define Why 1 analysis detail...",
              },
            ]),
      correctiveActions: actions.map((text) => ({ text })),
    },
  ];
}

function buildInvestigationView(
  incident: IncidentDto,
  options: Readonly<{
    reporter: string;
    severity: string;
    summaryText: string;
    bodyPart: string;
    injuryLabel: string;
    attachmentCount: number;
    witnessCount: number;
    isClosed: boolean;
  }>,
): IncidentInvestigationView {
  const whyChain = buildWhyChain(incident);
  const statusSteps = buildInvestigationStatusSteps(incident, {
    attachmentCount: options.attachmentCount,
    witnessCount: options.witnessCount,
    isClosed: options.isClosed,
    whyChainLength: whyChain.length,
  });
  const completed = statusSteps.filter((step) => step.completed).length;
  const statusLabel =
    options.isClosed || completed === statusSteps.length
      ? "Complete"
      : completed === 0
        ? "Not started"
        : "In progress";

  const ledBy = options.reporter !== "—" ? options.reporter : "Unassigned";

  return {
    whyChain,
    statusSteps,
    signoffs: buildSignoffs({
      reporter: options.reporter,
      isClosed: options.isClosed,
    }),
    statusLabel,
    ledBy,
    methodLine: `Method: 5 Whys · Led by ${ledBy} · Linked to HRCA worksheet`,
    hrcaMeta: buildHrcaMeta(incident, {
      severity: options.severity,
      summaryText: options.summaryText,
      bodyPart: options.bodyPart,
      injuryLabel: options.injuryLabel,
    }),
    hrcaRows: buildHrcaRows(incident),
  };
}

function buildInfoItems(
  incident: IncidentDto,
): readonly IncidentDetailInfoItem[] {
  const listRecord = mapIncidentDtoToListRecord(incident);
  const firstAid = isFirstAidSeverity(listRecord.severity);

  const items: IncidentDetailInfoItem[] = [
    {
      key: "severity",
      label: "Severity",
      value: listRecord.severity,
      kind: "text",
    },
    { key: "state", label: "State", value: listRecord.state, kind: "readonly" },
    {
      key: "siteLocation",
      label: "Site / location",
      value: listRecord.site,
      kind: "text",
    },
    {
      key: "incidentAt",
      label: "Incident at",
      value: formatDateTime(incident.incidentAt),
      kind: "text",
    },
    {
      key: "reportedAt",
      label: "Reported at",
      value: formatDateTime(incident.incidentReportedAt),
      kind: "text",
    },
    {
      key: "reporterEmail",
      label: "Reporter email",
      value: displayOrDash(incident.incidentReporterEmail),
      kind: "text",
    },
    {
      key: "caseDisposition",
      label: "Case disposition",
      value: displayOrDash(incident.caseDisposition),
      kind: "text",
    },
    {
      key: "isOSHARecordable",
      label: "OSHA recordable",
      value: yesNo(incident.isOSHARecordable),
      kind: "yesno",
    },
    {
      key: "isWorkRelated",
      label: "Work related",
      value: yesNo(incident.isWorkRelated),
      kind: "yesno",
    },
    {
      key: "isDrugOrAlcoholRelated",
      label: "Drug / alcohol related",
      value: yesNo(incident.isDrugOrAlcoholRelated),
      kind: "yesno",
    },
    {
      key: "isFleetVehicleInvolved",
      label: "Fleet vehicle involved",
      value: yesNo(incident.isFleetVehicleInvolved),
      kind: "yesno",
    },
    {
      key: "isSeriousIncident",
      label: "Serious incident",
      value: yesNo(incident.isSeriousIncident),
      kind: "yesno",
    },
    {
      key: "isEmergencyServiceCalled",
      label: "Emergency service called",
      value: yesNo(incident.isEmergencyServiceCalled),
      kind: "yesno",
    },
    {
      key: "isThirdPartyInvolved",
      label: "Third party involved",
      value: yesNo(incident.isThirdPartyInvolved),
      kind: "yesno",
    },
    {
      key: "initialTreatment",
      label: "Initial treatment",
      value: displayOrDash(incident.initialTreatment),
      kind: "text",
    },
    {
      key: "isSecondaryTreatmentSought",
      label: "Secondary treatment sought",
      value: yesNo(incident.isSecondaryTreatmentSought),
      kind: "yesno",
    },
    {
      key: "mechanismOfInjury",
      label: "Mechanism of injury",
      value: displayOrDash(incident.mechanismOfInjury),
      kind: "text",
    },
    {
      key: "natureOfInjury",
      label: "Nature of injury",
      value: displayOrDash(incident.natureOfInjury),
      kind: "text",
    },
    {
      key: "objectInvolved",
      label: "Object involved",
      value: displayOrDash(incident.objectInvolved),
      kind: "text",
    },
    {
      key: "isOSHANotificationRequired",
      label: "OSHA notification required",
      value: yesNo(incident.isOSHANotificationRequired),
      kind: "yesno",
    },
    {
      key: "whatTreatmentWasGiven",
      label: "Treatment given",
      value: displayOrDash(incident.whatTreatmentWasGiven),
      kind: "text",
    },
    {
      key: "treatmentProvidedBy",
      label: "Treatment provided by",
      value: displayOrDash(incident.treatmentProvidedBy),
      kind: "text",
    },
    {
      key: "treatmentLocation",
      label: "Treatment location",
      value: displayOrDash(incident.treatmentLocation),
      kind: "text",
    },
    {
      key: "isFitForFullDuty",
      label: "Fit for full duty",
      value: displayOrDash(
        typeof incident.isFitForFullDuty === "boolean"
          ? yesNo(incident.isFitForFullDuty)
          : incident.isFitForFullDuty,
      ),
      kind: "text",
    },
    {
      key: "furtherMedicalRecommendations",
      label: "Further medical recommended",
      value: yesNo(incident.furtherMedicalRecommendations),
      kind: "yesno",
    },
  ];

  if (firstAid) {
    return items;
  }

  // Non–First Aid: omit First Aid–only fields and any predefined N/A placeholders.
  return items.filter((item) => {
    if (FIRST_AID_ONLY_INFO_KEYS.has(item.key)) {
      return false;
    }
    if (isNaPlaceholder(item.value)) {
      return false;
    }
    return true;
  });
}

function buildResponders(
  incident: IncidentDto,
  reporterName: string,
): ResponderMember[] {
  const responders: ResponderMember[] = [];
  const seenNames = new Set<string>();

  const push = (member: ResponderMember) => {
    const nameKey = member.name.trim().toLowerCase();
    if (!nameKey || seenNames.has(nameKey)) {
      return;
    }
    seenNames.add(nameKey);
    responders.push(member);
  };

  if (reporterName !== "—") {
    push({
      role: "Reporter",
      name: reporterName,
      initials: initialsFromName(reporterName),
      empId: incident.incidentReporterEmail?.trim() || "—",
      badgeLabel: "Reporter",
      badgeTone: "teal",
    });
  }

  for (const person of incident.people ?? []) {
    if (isWitness(person) || isAffected(person)) {
      continue;
    }

    const name = person.name?.trim();
    if (!name) {
      continue;
    }

    const role = person.role?.trim() || "Team member";
    const isReporterRole = role.toLowerCase().includes("reporter");

    push({
      role,
      name,
      initials: initialsFromName(name),
      empId: "—",
      badgeLabel: isReporterRole ? "Reporter" : "Assigned",
      badgeTone: isReporterRole ? "teal" : "blue",
    });
  }

  const treatmentBy = incident.treatmentProvidedBy?.trim();
  if (
    treatmentBy &&
    treatmentBy.toLowerCase() !== "n/a" &&
    !seenNames.has(treatmentBy.toLowerCase())
  ) {
    push({
      role: "Treatment provider",
      name: treatmentBy,
      initials: initialsFromName(treatmentBy),
      empId: "—",
      badgeLabel: "Care",
      badgeTone: "green",
    });
  }

  return responders;
}

function buildRoutingMembers(
  incident: IncidentDto,
  reporterName: string,
): IncidentRoutingMember[] {
  const members: IncidentRoutingMember[] = [];
  const people = incident.people ?? [];
  const affected = resolveAffectedPerson(incident);
  const witnesses = people.filter(isWitness);
  const reporterEmail = incident.incidentReporterEmail?.trim() || undefined;

  if (reporterName !== "—") {
    members.push({
      role: "Reporter",
      name: reporterName,
      initials: initialsFromName(reporterName),
      subtitle: reporterEmail,
    });
  }

  const affectedName = affected?.name?.trim();
  if (affectedName) {
    const affectedId = incident.affectedPersonId?.trim();
    const subtitle =
      affectedId && affectedId.toLowerCase() !== affectedName.toLowerCase()
        ? affectedId
        : undefined;

    members.push({
      role: "Affected person",
      name: affectedName,
      initials: initialsFromName(affectedName),
      subtitle,
    });
  }

  if (witnesses.length > 0) {
    const primary = witnesses[0]!;
    const primaryName = primary.name?.trim() || "Unknown";
    const extraCount = witnesses.length - 1;

    members.push({
      role: witnesses.length > 1 ? "Witnesses" : "Witness",
      name:
        extraCount > 0 ? `${primaryName} +${String(extraCount)}` : primaryName,
      initials: initialsFromName(primaryName),
      subtitle: undefined,
    });
  }

  return members;
}

export type MapIncidentDetailOptions = Readonly<{
  /** Current login user — used as attachment "Added by" (API has no uploader). */
  uploadedBy?: string | null;
}>;

/**
 * Maps GET /api/v1/incidents/{id} payload into the detail page view model.
 */
export function mapIncidentDtoToDetailView(
  incident: IncidentDto,
  options?: MapIncidentDetailOptions,
): IncidentDetailViewModel {
  const listRecord = mapIncidentDtoToListRecord(incident);
  const people = incident.people ?? [];
  const affected = resolveAffectedPerson(incident);
  const witnesses = people.filter(isWitness);

  const bodyPart =
    affected?.bodyPartAffected?.trim() ||
    incident.injuredBodyPart?.trim() ||
    "—";
  const treatment =
    meaningfulText(incident.whatTreatmentWasGiven) ||
    meaningfulText(incident.initialTreatment) ||
    "None required";
  // Comes from `stage`, the backend's computed lifecycle value. Older backends
  // omit it on the single-incident read; withDetailClosedState below is how the
  // detail screen fills that gap from the closure record it already loads.
  const isClosed = listRecord.state === "Closed";
  const responseActions = parseResponseActions(incident.actionTaken);
  const uploadedBy = options?.uploadedBy?.trim() || "You";
  const attachments = mapImagesToAttachments(incident.images, uploadedBy);
  const timelineEvents = buildTimelineEvents(incident, {
    severity: listRecord.severity,
    reporter: listRecord.reporter,
    site: listRecord.site,
    isClosed,
  });
  const responseMetrics = buildResponseMetrics(incident, {
    isClosed,
    attachmentCount: attachments.length,
    completedActionCount: responseActions.filter((action) => action.completed)
      .length,
  });
  const mappedWitnesses = witnesses.map((person, index) => {
    const name = person.name?.trim() || "Unknown";
    const hasStatement = index === 0;
    return {
      name,
      role: person.role?.trim() || "Witness",
      initials: initialsFromName(name),
      badgeLabel: hasStatement ? "Statement" : "Pending",
      badgeTone: hasStatement ? ("green" as const) : ("gray" as const),
    };
  });
  const investigation = buildInvestigationView(incident, {
    reporter: listRecord.reporter,
    severity: listRecord.severity,
    summaryText: listRecord.description,
    bodyPart,
    injuryLabel: listRecord.injury,
    attachmentCount: attachments.length,
    witnessCount: mappedWitnesses.length,
    isClosed,
  });

  const routingMembers = buildRoutingMembers(incident, listRecord.reporter);
  const responders = buildResponders(incident, listRecord.reporter);
  const affectedName = affected?.name?.trim() || "";
  const affectedId = incident.affectedPersonId?.trim() || "";
  // Intake writes the same text into both `name` and `affectedPersonId` when
  // the reporter enters an employee number rather than picking from the roster
  // (`parseAffectedPerson`), so the two carry one value. Showing it in both
  // slots printed the number twice over; the id row stays empty when it would
  // only repeat the name, and the card drops the row entirely.
  const affectedEmpId =
    affectedId &&
    (!affectedName || affectedId.toLowerCase() !== affectedName.toLowerCase())
      ? affectedId
      : "—";
  const affectedInjuryLabel =
    affected?.injuryLevel?.trim() ||
    incident.natureOfInjury?.trim() ||
    listRecord.injury ||
    "—";

  return {
    displayId: listRecord.id,
    numericId: listRecord.numericId,
    title: listRecord.title,
    summaryText: listRecord.description,
    infoItems: buildInfoItems(incident),
    responseActions,
    responseNotes:
      incident.otherNotes?.trim() || incident.actionTaken?.trim() || "",
    affectedName: affectedName || "No affected person logged",
    affectedRole: [
      affected?.role?.trim() || "Affected person",
      listRecord.site !== "—" ? listRecord.site : null,
    ]
      .filter(Boolean)
      .join(" · "),
    affectedEmpId,
    affectedInitials: affectedAvatarText(affectedName),
    affectedInjuryLabel,
    bodyPart,
    treatment,
    // GetIncidentById carries no days-away field, so there is nothing to map.
    // "—" rather than 0, which would read as a measured zero days away.
    daysAway: "—",
    responders,
    witnesses: mappedWitnesses,
    attachments,
    timelineEvents,
    responseMetrics,
    investigation,
    routingMembers,
    severity: listRecord.severity,
    state: listRecord.state,
    site: listRecord.site,
    reportedAt: listRecord.reportedAt,
    reporter: listRecord.reporter,
    isClosed,
  };
}

/**
 * Overlays a closed verdict the incident payload could not supply.
 *
 * `GET /incidents/{id}` predates the closure wizard and returns no lifecycle
 * field on older backends, so a view model built from it alone reads Open even
 * for a finalised incident — which is what let the closure wizard be re-entered
 * after it had already run. The detail screen loads the closure record anyway,
 * so it can answer the question the incident payload cannot.
 *
 * Only the two lifecycle fields are patched; the narrative parts of the model
 * (timeline, metrics, investigation) still follow `stage`, so a backend that
 * returns it stays the single source for the whole model.
 */
export function withDetailClosedState(
  detail: IncidentDetailViewModel | null,
  isClosed: boolean,
): IncidentDetailViewModel | null {
  if (!detail || !isClosed || detail.isClosed) {
    return detail;
  }

  return { ...detail, isClosed: true, state: "Closed" };
}

/** Accepts route param like `42` or `INC-42`. */
export function parseIncidentRouteId(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const fromPrefix = /^INC-(\d+)$/i.exec(trimmed);
  if (fromPrefix) {
    return Number(fromPrefix[1]);
  }

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber > 0) {
    return Math.trunc(asNumber);
  }

  return null;
}
