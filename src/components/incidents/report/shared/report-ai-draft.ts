import type { IncidentDraftRequestDto } from "@/dtos/req/ai-text-request.dto";
import type { ReportIncidentFormState } from "@/forms/incident-module/form-state";
import { seriousIncidentLabelForDraft } from "@/forms/incident-module/classification";
import { formatIncidentLocationsLabel } from "./ReportLocationsField";
import { SEVERITY_OPTIONS } from "@/forms/incident-module/severity";
import { INJURY_LEVEL_OPTIONS } from "@/forms/incident-module/injury-level";
import { BODY_PART_OPTIONS } from "@/forms/incident-module/body-parts";
import {
  INITIAL_TREATMENT_OPTIONS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
} from "@/forms/incident-module/treatment";
import { parseReportDateTime } from "@/services/mappers/report-incident.mapper";

/**
 * The draft offered for "Describe incident in detail".
 *
 * Held outside `description` until accepted, so a draft can never be submitted
 * by someone who simply didn't notice it sitting in the field.
 */
export type ReportDescriptionDraft = Readonly<{
  text: string | null;
  pending: boolean;
  /** Fingerprint of the answers this draft was asked for; `""` before the first run. */
  source: string;
  /** Set once the reporter declines it or starts writing their own. */
  dismissed: boolean;
  /**
   * A draft has been fetched for this report; the automatic pass is spent.
   *
   * Without it the draft was re-fetched every time an answer above it changed,
   * and each of those drafts but the last was discarded before the reporter
   * ever saw it. Redrafting is now theirs to ask for.
   */
  drafted: boolean;
}>;

export const EMPTY_DESCRIPTION_DRAFT: ReportDescriptionDraft = {
  text: null,
  pending: false,
  source: "",
  dismissed: false,
  drafted: false,
};

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

/**
 * Turns the form into a draft-assist request.
 *
 * Labels throughout, never ids — the model reads these as prose, so `severity`
 * goes as `"Serious"` and the classification answers as the `"Yes"` / `"No"`
 * the reporter actually saw. Blank fields are left out: an empty string reads
 * as a fact about the incident rather than an absent one.
 */
export function buildDraftAssistInput(
  form: ReportIncidentFormState,
): IncidentDraftRequestDto {
  const bodyParts = [
    ...form.bodyParts.map(
      (id) => BODY_PART_OPTIONS.find((part) => part.id === id)?.label ?? id,
    ),
    ...(form.customBodyParts ?? []).filter((part) => part.trim()),
  ].join(", ");

  const incidentAreas = formatIncidentLocationsLabel(
    form.incidentLocations ?? [],
  );
  const plant = form.location.trim();

  const input: IncidentDraftRequestDto = {
    severity:
      SEVERITY_OPTIONS.find((option) => option.id === form.severity)?.label ??
      "",
    location: [plant, incidentAreas].filter(Boolean).join(" · "),
    fleetVehicleInvolved: form.classifications.fleet ?? "",
    thirdPartyInvolved: form.classifications.tempWorker ?? "",
    emergencyServicesCalled: form.classifications.emergency ?? "",
    seriousIncident: seriousIncidentLabelForDraft(form.classifications.serious),
    mechanismOfInjury: optionLabel(MECHANISM_OPTIONS, form.mechanismOfInjury),
    natureOfInjury: optionLabel(NATURE_OF_INJURY_OPTIONS, form.natureOfInjury),
    objectInvolved: form.objectInvolved.trim(),
    initialTreatment: optionLabel(
      INITIAL_TREATMENT_OPTIONS,
      form.initialTreatment,
    ),
    injuredBodyPart: bodyParts,
    injuryLevel:
      INJURY_LEVEL_OPTIONS.find((option) => option.id === form.injuryLevel)
        ?.label ?? "",
  };

  // Only sent once a date exists — `parseReportDateTime` falls back to "now"
  // for a blank one, which would tell the model the incident happened at the
  // moment the form was opened.
  if (form.incidentDate.trim()) {
    input.incidentAt = parseReportDateTime(
      form.incidentDate,
      form.incidentTime,
    );
  }

  // Sending the reporter's own words makes the response's `description` null —
  // the backend refuses to replace an account a human has already given. That
  // is exactly what should happen, so it is sent whenever it exists.
  if (form.description.trim()) {
    input.description = form.description.trim();
  }

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== ""),
  ) as IncidentDraftRequestDto;
}

/**
 * A stable fingerprint of a request, so the same answers are never drafted
 * twice. Key order is fixed by `buildDraftAssistInput`, so serialising is
 * enough — no sorting needed.
 */
export function draftInputKey(input: IncidentDraftRequestDto): string {
  return JSON.stringify(input);
}

/**
 * Whether the answers a description is drafted from are complete.
 *
 * Every required field above the description box, in the order they appear:
 * Object Involved is the last of them, so in practice this turns true the
 * moment it is filled and the draft fires off the back of it.
 *
 * Waiting for all of them rather than guessing from a couple is what stops the
 * reporter being handed a draft built from half the facts — and every call
 * comes out of a 20-per-minute budget shared with both rewrite buttons, so a
 * draft that has to be regenerated as the remaining answers arrive is spend
 * for nothing.
 */
export function canDraftDescription(form: ReportIncidentFormState): boolean {
  const required = [
    form.secondaryTreatment,
    form.mechanismOfInjury,
    form.natureOfInjury,
    form.objectInvolved,
  ];

  if (form.severity !== "first-aid") {
    required.unshift(form.initialTreatment);
  }

  return required.every((answer) => answer.trim() !== "");
}
