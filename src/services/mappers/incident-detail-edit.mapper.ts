import type {
  AttachmentItem,
  IncidentDetailInfoItem,
  ResponderMember,
  WitnessRow,
} from "@/components/incidents/detail/incident-detail-types";
import type { IncidentDetailResponseAction } from "@/components/incidents/detail/incident-detail-types";
import {
  buildActionTaken,
  splitActionTaken,
} from "@/components/incidents/report/shared/report-response";
import type { IncidentDto, PersonDto } from "@/dtos/res/incident-response.dto";

export type IncidentDetailEditDraft = Readonly<{
  summary: string;
  responseNotes: string;
  responseActions: readonly IncidentDetailResponseAction[];
  infoItems: readonly IncidentDetailInfoItem[];
}>;

function parseYesNo(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes") {
    return true;
  }
  if (normalized === "no") {
    return false;
  }
  return undefined;
}

/** Accepts `YYYY-MM-DD HH:mm` (detail display) or ISO-ish strings. */
function parseEditableDateTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(trimmed);
  if (match) {
    const iso = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00`;
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }

  return trimmed;
}

function splitSiteLocation(raw: string): { site: string; location: string } {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—") {
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

function editableText(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") {
    return null;
  }
  return trimmed;
}

/**
 * Merges Details-tab draft edits into an existing GetById incident payload.
 */
export function applyDetailEditDraft(
  existing: IncidentDto,
  draft: IncidentDetailEditDraft,
): Partial<IncidentDto> {
  // The notes already stored under the actions line are carried across
  // untouched: they are edited through the Response notes box, not this card,
  // and rebuilding from the ticks alone would delete them.
  const { notes: storedActionNotes } = splitActionTaken(existing.actionTaken);
  const actionTaken = buildActionTaken(
    draft.responseActions
      .filter((action) => action.completed)
      .map((action) => action.label),
    storedActionNotes,
  );

  const patch: Partial<IncidentDto> = {
    description: draft.summary.trim() || existing.description,
    otherNotes: draft.responseNotes.trim() || null,
    actionTaken: actionTaken || null,
  };

  const byKey = new Map(draft.infoItems.map((item) => [item.key, item.value]));

  const severity = editableText(byKey.get("severity") ?? "");
  if (severity !== null) {
    patch.severity = severity;
  }

  const siteLocation = byKey.get("siteLocation");
  if (siteLocation !== undefined) {
    const { site, location } = splitSiteLocation(siteLocation);
    // `""`, not null: Site and Location are `[Required]` non-nullable strings
    // on the backend, so clearing the field in edit mode would 400 the PUT the
    // same way a null ActionTaken 400s a create. See EMPTY_NOT_NULL in
    // `report-incident.mapper.ts`.
    patch.site = site || "";
    patch.location = location || "";
  }

  const incidentAt = parseEditableDateTime(byKey.get("incidentAt") ?? "");
  if (incidentAt !== null) {
    patch.incidentAt = incidentAt;
  }

  const reportedAt = parseEditableDateTime(byKey.get("reportedAt") ?? "");
  if (reportedAt !== null) {
    patch.incidentReportedAt = reportedAt;
  }

  const reporterEmail = editableText(byKey.get("reporterEmail") ?? "");
  if (reporterEmail !== null) {
    patch.incidentReporterEmail = reporterEmail;
  }

  const caseDisposition = editableText(byKey.get("caseDisposition") ?? "");
  if (caseDisposition !== null) {
    patch.caseDisposition = caseDisposition;
  }

  const yesNoFields: Array<[string, keyof IncidentDto]> = [
    ["isOSHARecordable", "isOSHARecordable"],
    ["isWorkRelated", "isWorkRelated"],
    ["isDrugOrAlcoholRelated", "isDrugOrAlcoholRelated"],
    ["isFleetVehicleInvolved", "isFleetVehicleInvolved"],
    ["isSeriousIncident", "isSeriousIncident"],
    ["isEmergencyServiceCalled", "isEmergencyServiceCalled"],
    ["isThirdPartyInvolved", "isThirdPartyInvolved"],
    ["isSecondaryTreatmentSought", "isSecondaryTreatmentSought"],
    ["isOSHANotificationRequired", "isOSHANotificationRequired"],
    ["furtherMedicalRecommendations", "furtherMedicalRecommendations"],
  ];

  for (const [key, field] of yesNoFields) {
    const parsed = parseYesNo(byKey.get(key) ?? "");
    if (parsed !== undefined) {
      (patch as Record<string, unknown>)[field] = parsed;
    }
  }

  const textFields: Array<[string, keyof IncidentDto]> = [
    ["initialTreatment", "initialTreatment"],
    ["mechanismOfInjury", "mechanismOfInjury"],
    ["natureOfInjury", "natureOfInjury"],
    ["objectInvolved", "objectInvolved"],
    ["whatTreatmentWasGiven", "whatTreatmentWasGiven"],
    ["treatmentProvidedBy", "treatmentProvidedBy"],
    ["treatmentLocation", "treatmentLocation"],
    ["isFitForFullDuty", "isFitForFullDuty"],
  ];

  for (const [key, field] of textFields) {
    const value = editableText(byKey.get(key) ?? "");
    if (value !== null) {
      (patch as Record<string, unknown>)[field] = value;
    } else if (byKey.has(key)) {
      (patch as Record<string, unknown>)[field] = null;
    }
  }

  return patch;
}

export type IncidentPeopleEditDraft = Readonly<{
  affectedName: string;
  affectedEmpId: string;
  affectedInjuryLabel: string;
  bodyPart: string;
  treatment: string;
  responders: readonly ResponderMember[];
  witnesses: readonly WitnessRow[];
}>;

function roleIncludes(person: PersonDto, needle: string): boolean {
  return (person.role?.trim().toLowerCase() ?? "").includes(needle);
}

function isReporterResponder(member: ResponderMember): boolean {
  const role = member.role.trim().toLowerCase();
  return member.badgeLabel === "Reporter" || role.includes("reporter");
}

function isTreatmentResponder(member: ResponderMember): boolean {
  const role = member.role.trim().toLowerCase();
  return member.badgeLabel === "Care" || role.includes("treatment");
}

/**
 * Merges People-tab draft edits into an existing GetById incident payload.
 */
export function applyPeopleEditDraft(
  existing: IncidentDto,
  draft: IncidentPeopleEditDraft,
): Partial<IncidentDto> {
  const existingPeople = existing.people ?? [];
  const existingAffected = existingPeople.find((person) =>
    roleIncludes(person, "affected"),
  );
  const people: PersonDto[] = [];

  const reporterResponder = draft.responders.find(isReporterResponder);
  const reporterName =
    editableText(reporterResponder?.name ?? "") ??
    editableText(
      existingPeople.find((person) => roleIncludes(person, "reporter"))?.name ??
        "",
    );

  if (reporterName) {
    people.push({
      name: reporterName,
      role: "Reporter",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    });
  }

  const affectedName = editableText(draft.affectedName);
  if (affectedName) {
    people.push({
      name: affectedName,
      role: "Affected person",
      injuryLevel: editableText(draft.affectedInjuryLabel),
      bodyPartAffected: editableText(draft.bodyPart),
      injuryDescription: existingAffected?.injuryDescription ?? null,
    });
  }

  for (const member of draft.responders) {
    if (isReporterResponder(member) || isTreatmentResponder(member)) {
      continue;
    }
    const name = editableText(member.name);
    if (!name) {
      continue;
    }
    people.push({
      name,
      role: editableText(member.role) || "Team member",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    });
  }

  for (const witness of draft.witnesses) {
    const name = editableText(witness.name);
    if (!name) {
      continue;
    }
    people.push({
      name,
      role: editableText(witness.role) || "Witness",
      injuryLevel: null,
      bodyPartAffected: null,
      injuryDescription: null,
    });
  }

  const treatmentProvider = draft.responders.find(isTreatmentResponder);
  const reporterEmpId = editableText(reporterResponder?.empId ?? "");
  const reporterEmail =
    reporterEmpId && reporterEmpId.includes("@")
      ? reporterEmpId
      : editableText(existing.incidentReporterEmail ?? "");

  const treatment = editableText(draft.treatment);
  const bodyPart = editableText(draft.bodyPart);
  const injuryLabel = editableText(draft.affectedInjuryLabel);
  const affectedEmpId = editableText(draft.affectedEmpId);

  return {
    people,
    affectedPersonId: affectedEmpId ?? affectedName,
    injuredBodyPart: bodyPart,
    natureOfInjury: injuryLabel,
    whatTreatmentWasGiven: treatment,
    initialTreatment: treatment,
    treatmentProvidedBy:
      editableText(treatmentProvider?.name ?? "") ??
      existing.treatmentProvidedBy ??
      null,
    incidentReporterEmail: reporterEmail,
  };
}

/**
 * Persists the remaining Attachments-tab files as `images` URL strings.
 */
export function applyAttachmentsEditDraft(
  attachments: readonly AttachmentItem[],
): Partial<IncidentDto> {
  const images = attachments
    .map((item) => item.secureUrl?.trim())
    .filter((url): url is string => Boolean(url));

  return {
    images: images.length > 0 ? images : [],
  };
}
