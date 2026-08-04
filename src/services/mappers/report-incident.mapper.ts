import {
  applySeverityFieldDefaults,
  type ReportIncidentFormState,
} from "@/components/incidents/report/shared/report-incident-state";
import {
  formatBodyPartSelection,
  BODY_PART_OPTIONS,
} from "@/components/incidents/report/shared/report-body-parts";
import { INJURY_LEVEL_OPTIONS } from "@/components/incidents/report/shared/report-injury-level";
import { SEVERITY_OPTIONS } from "@/components/incidents/report/shared/report-severity";
import {
  CASE_DISPOSITION_OPTIONS,
  INITIAL_TREATMENT_OPTIONS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
  TREATMENT_LOCATION_OPTIONS,
  TREATMENT_PROVIDER_OPTIONS,
  WHAT_TREATMENT_GIVEN_OPTIONS,
} from "@/components/incidents/report/shared/report-treatment";
import { IMMEDIATE_ACTION_OPTIONS } from "@/components/incidents/report/shared/report-response";
import type { IncidentDto, PersonDto } from "@/dtos/res/incident-response.dto";
import { withAttachmentDisplayName } from "@/lib/attachment-url";
import { getAuthDisplayName, type AuthContext } from "@/lib/auth-context";

/** `""` (unanswered) and `"No"` both map to false. */
function yes(value: "Yes" | "No" | "" | undefined): boolean {
  return value === "Yes";
}

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

function splitSiteLocation(raw: string): {
  site: string;
  location: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { site: "", location: "" };
  }

  const separator = "·";
  const index = trimmed.indexOf(separator);
  if (index === -1) {
    return { site: trimmed, location: trimmed };
  }

  return {
    site: trimmed.slice(0, index).trim(),
    location: trimmed.slice(index + separator.length).trim(),
  };
}

function parseAffectedPerson(raw: string): {
  name: string;
  affectedPersonId: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { name: "", affectedPersonId: "" };
  }

  const parts = trimmed.split("·").map((part) => part.trim());
  if (parts.length >= 2) {
    return {
      name: parts[0] ?? trimmed,
      affectedPersonId: parts[1] ?? "",
    };
  }

  return { name: trimmed, affectedPersonId: trimmed };
}

/**
 * Parses UI date/time strings into ISO. Supports:
 * - `MM/DD/YYYY` + `HH:MM` (24-hour) or `hh:mm AM/PM`
 * - date-only / empty → falls back to `fallback`
 */
export function parseReportDateTime(
  dateValue: string,
  timeValue: string,
  fallback: Date = new Date(),
): string {
  const date = dateValue.trim();
  const time = timeValue.trim();

  if (!date && !time) {
    return fallback.toISOString();
  }

  // MM/DD/YYYY
  const dateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);
  if (dateMatch) {
    const month = Number(dateMatch[1]);
    const day = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);

    let hours = fallback.getHours();
    let minutes = fallback.getMinutes();

    const time24Match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(time);
    const time12Match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);

    if (time12Match) {
      hours = Number(time12Match[1]) % 12;
      minutes = Number(time12Match[2]);
      if (time12Match[3].toUpperCase() === "PM") {
        hours += 12;
      }
    } else if (time24Match) {
      hours = Number(time24Match[1]);
      minutes = Number(time24Match[2]);
    }

    const parsed = new Date(year, month - 1, day, hours, minutes, 0, 0);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const combined = [date, time].filter(Boolean).join(" ");
  const native = new Date(combined);
  if (!Number.isNaN(native.getTime())) {
    return native.toISOString();
  }

  return fallback.toISOString();
}

function buildIncidentTitle(
  form: ReportIncidentFormState,
  severityLabel: string,
): string {
  return form.title.trim() || severityLabel;
}

function buildIncidentDescription(form: ReportIncidentFormState): string {
  return form.description.trim();
}

function buildActionTaken(form: ReportIncidentFormState): string {
  const labels = form.immediateActions
    .map(
      (id) =>
        IMMEDIATE_ACTION_OPTIONS.find((option) => option.id === id)?.label ??
        id,
    )
    .filter(Boolean);

  const notes = form.actionNotes.trim();
  if (labels.length === 0) {
    return notes;
  }

  if (!notes) {
    return labels.join("; ");
  }

  return `${labels.join("; ")}\n${notes}`;
}

function buildOtherNotes(form: ReportIncidentFormState): string {
  const parts: string[] = [];

  if (form.witnesses.trim()) {
    parts.push(`Witnesses: ${form.witnesses.trim()}`);
  }

  if (form.suggestedFollowUp.length > 0) {
    parts.push(`Suggested follow-up: ${form.suggestedFollowUp.join(", ")}`);
  }

  if (form.gender.trim()) {
    parts.push(`Gender: ${form.gender.trim()}`);
  }

  return parts.join("\n");
}

function buildPeople(form: ReportIncidentFormState): PersonDto[] {
  const people: PersonDto[] = [];
  const { name } = parseAffectedPerson(form.affectedPerson);
  const injuryLevel =
    INJURY_LEVEL_OPTIONS.find((option) => option.id === form.injuryLevel)
      ?.label ?? form.injuryLevel;
  const mappedBodyParts = formatBodyPartSelection(
    form.bodyParts,
    form.bodySide,
    form.bodyPartSides,
  );
  const customParts = (form.customBodyParts ?? []).filter((part) =>
    part.trim(),
  );
  // Custom parts append to the anatomical selection; on their own they replace
  // the "None selected" placeholder rather than reading as nothing chosen.
  const bodyPartAffected =
    customParts.length === 0
      ? mappedBodyParts
      : mappedBodyParts === "None selected"
        ? customParts.join(", ")
        : `${mappedBodyParts}, ${customParts.join(", ")}`;

  const reporterName = form.reportedBy.trim();
  if (reporterName) {
    people.push({
      name: reporterName,
      role: "Reporter",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    });
  }

  if (
    name ||
    form.injuryDescription.trim() ||
    form.bodyParts.length > 0 ||
    customParts.length > 0
  ) {
    people.push({
      name: name || null,
      role: "Affected person",
      injuryLevel,
      bodyPartAffected:
        bodyPartAffected === "None selected" ? null : bodyPartAffected,
      injuryDescription: form.injuryDescription.trim() || null,
    });
  }

  const witnesses = form.witnesses
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const witness of witnesses) {
    people.push({
      name: witness,
      role: "Witness",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    });
  }

  return people;
}

export function mapReportFormToIncidentDto(
  form: ReportIncidentFormState,
  auth: AuthContext | null,
): IncidentDto {
  // Non–First Aid severities get First Aid field defaults from form state.
  const source = applySeverityFieldDefaults(form);
  const { site, location } = splitSiteLocation(source.location);
  const { name: affectedName, affectedPersonId } = parseAffectedPerson(
    source.affectedPerson,
  );
  const severityLabel =
    SEVERITY_OPTIONS.find((option) => option.id === source.severity)?.label ??
    source.severity;

  const incidentAt = parseReportDateTime(
    source.incidentDate,
    source.incidentTime,
  );
  const incidentReportedAt = parseReportDateTime(
    source.reportDate || source.incidentDate,
    source.incidentTime,
  );

  const bodyPartLabels = [
    ...source.bodyParts.map(
      (id) => BODY_PART_OPTIONS.find((part) => part.id === id)?.label ?? id,
    ),
    ...(source.customBodyParts ?? []).filter((part) => part.trim()),
  ].join(", ");

  // Persist original filename on the URL (`?n=`) — API only stores string URLs.
  const images = source.photos
    .map((photo) => {
      const url = (photo.secureUrl || photo.url)?.trim();
      if (!url) {
        return null;
      }
      const fileName = photo.name?.trim() || "file";
      return withAttachmentDisplayName(url, fileName);
    })
    .filter((url): url is string => Boolean(url));

  return {
    id: 0,
    title: buildIncidentTitle(source, severityLabel),
    severity: severityLabel,
    site,
    location,
    description: buildIncidentDescription(source),
    isDrop: false,
    incidentAt,
    incidentReportedAt,
    isOSHARecordable: yes(source.classifications.osha),
    isWorkRelated: yes(source.classifications.workRelated),
    isDrugOrAlcoholRelated: yes(source.classifications.drugAlcohol),
    isFleetVehicleInvolved: yes(source.classifications.fleet),
    isSeriousIncident: yes(source.classifications.serious),
    isEmergencyServiceCalled: yes(source.classifications.emergency),
    isThirdPartyInvolved: yes(source.classifications.tempWorker),
    initialTreatment: optionLabel(
      INITIAL_TREATMENT_OPTIONS,
      source.initialTreatment,
    ),
    isSecondaryTreatmentSought: yes(source.secondaryTreatment),
    mechanismOfInjury: optionLabel(MECHANISM_OPTIONS, source.mechanismOfInjury),
    natureOfInjury: optionLabel(
      NATURE_OF_INJURY_OPTIONS,
      source.natureOfInjury,
    ),
    objectInvolved: source.objectInvolved.trim(),
    isOSHANotificationRequired: yes(source.oshaNotificationRequired),
    affectedPersonId: affectedPersonId || affectedName || null,
    reportedById: auth?.userId ?? 0,
    userId: auth?.userId ?? 0,
    siteId: auth?.siteId ?? 0,
    injuredBodyPart: bodyPartLabels || null,
    injuryDescription: source.injuryDescription.trim() || null,
    incidentReporterEmail: source.reporterEmail.trim() || auth?.email || null,
    occurredInCanada: false,
    nonEmployeInvolved: yes(source.classifications.tempWorker),
    whatTreatmentWasGiven:
      optionLabel(WHAT_TREATMENT_GIVEN_OPTIONS, source.whatTreatmentWasGiven) ||
      optionLabel(INITIAL_TREATMENT_OPTIONS, source.initialTreatment) ||
      "N/A",
    treatmentProvidedBy:
      optionLabel(TREATMENT_PROVIDER_OPTIONS, source.treatmentProvidedBy) ||
      source.reportedBy.trim() ||
      getAuthDisplayName("N/A"),
    treatmentLocation:
      optionLabel(TREATMENT_LOCATION_OPTIONS, source.treatmentLocation) ||
      location ||
      site ||
      "N/A",
    furtherMedicalRecommendations: source.furtherMedicalRecommended === "Yes",
    images,
    people: buildPeople(source),
    actionTaken: buildActionTaken(source) || null,
    otherNotes: buildOtherNotes(source) || null,
    isFitForFullDuty: source.isFitForFullDuty.trim() || "N/A",
    caseDisposition:
      optionLabel(CASE_DISPOSITION_OPTIONS, source.caseDisposition) ||
      source.caseDisposition.trim() ||
      "N/A",
    feedback: source.feedback.trim() || "N/A",
  };
}
