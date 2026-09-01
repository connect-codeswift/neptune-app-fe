import type { AiAssistFields } from "@/dtos/req/ai-text-request.dto";
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

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

/**
 * Turns the form into the fields a draft is composed from.
 *
 * Labels on both sides, never ids — the model reads the keys and the values
 * alike as prose, so the key is the question as the form asks it ("Mechanism of
 * injury") and the value is the answer as the reporter saw it ("Serious", and
 * the classification answers as "Yes" / "No"). Blank fields are left out: an
 * empty string reads as a fact about the incident rather than an absent one.
 */
export function buildDraftAssistInput(
  form: ReportIncidentFormState,
): AiAssistFields {
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

  const input: AiAssistFields = {
    Severity:
      SEVERITY_OPTIONS.find((option) => option.id === form.severity)?.label ??
      "",
    Location: [plant, incidentAreas].filter(Boolean).join(" · "),
    "Fleet vehicle involved": form.classifications.fleet ?? "",
    "Third party involved": form.classifications.tempWorker ?? "",
    "Emergency services called": form.classifications.emergency ?? "",
    "Serious incident": seriousIncidentLabelForDraft(
      form.classifications.serious,
    ),
    "Mechanism of injury": optionLabel(
      MECHANISM_OPTIONS,
      form.mechanismOfInjury,
    ),
    "Nature of injury": optionLabel(
      NATURE_OF_INJURY_OPTIONS,
      form.natureOfInjury,
    ),
    "Object involved": form.objectInvolved.trim(),
    "Initial treatment": optionLabel(
      INITIAL_TREATMENT_OPTIONS,
      form.initialTreatment,
    ),
    "Injured body part": bodyParts,
    "Injury level":
      INJURY_LEVEL_OPTIONS.find((option) => option.id === form.injuryLevel)
        ?.label ?? "",
  };

  // Only sent once a date exists — `parseReportDateTime` falls back to "now"
  // for a blank one, which would tell the model the incident happened at the
  // moment the form was opened.
  if (form.incidentDate.trim()) {
    input["Occurred at"] = parseReportDateTime(
      form.incidentDate,
      form.incidentTime,
    );
  }

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== ""),
  );
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
