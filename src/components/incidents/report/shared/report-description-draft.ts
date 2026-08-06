import type { ReportIncidentFormState } from "./report-incident-state";
import { SEVERITY_OPTIONS } from "./report-severity";
import {
  INITIAL_TREATMENT_OPTIONS,
  MECHANISM_OPTIONS,
  NATURE_OF_INJURY_OPTIONS,
} from "./report-treatment";
import { formatHhMmAs12Hour } from "./report-date-time";

/**
 * A draft offered for "Describe incident in detail", and how it was produced.
 *
 * `isAi` is not decoration. Accepting an AI-written draft is recorded against
 * the incident in `AiAssistedFields`, and the fallback below is written by this
 * file rather than a model — labelling that as AI would put a false provenance
 * claim on an OSHA-relevant record, so the two are told apart all the way
 * through.
 */
export type ReportDescriptionDraft = Readonly<{
  text: string | null;
  isAi: boolean;
  pending: boolean;
  /** The composed facts this draft was built from; `""` before the first run. */
  source: string;
  /** Set once the reporter declines or starts writing their own. */
  dismissed: boolean;
}>;

export const EMPTY_DESCRIPTION_DRAFT: ReportDescriptionDraft = {
  text: null,
  isAi: false,
  pending: false,
  source: "",
  dismissed: false,
};

function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return options.find((option) => option.value === trimmed)?.label ?? trimmed;
}

function sentence(parts: readonly string[]): string {
  const body = parts.filter(Boolean).join(" ");
  return body ? `${body}.` : "";
}

/**
 * Restates what the reporter has already answered as plain prose.
 *
 * Every clause is a field they filled in — nothing here infers, estimates or
 * fills a gap. That is the whole point: this text is the seed the model is
 * asked to tidy, and a model given invented facts will confidently keep them.
 * An unanswered field simply produces no clause.
 */
export function buildDescriptionFacts(form: ReportIncidentFormState): string {
  const severity =
    SEVERITY_OPTIONS.find((option) => option.id === form.severity)?.label ?? "";
  const person = form.affectedPerson.trim();
  const place = form.location.trim();
  const date = form.incidentDate.trim();
  const time =
    formatHhMmAs12Hour(form.incidentTime) || form.incidentTime.trim();

  const mechanism = optionLabel(MECHANISM_OPTIONS, form.mechanismOfInjury);
  const nature = optionLabel(NATURE_OF_INJURY_OPTIONS, form.natureOfInjury);
  const object = form.objectInvolved.trim();
  const treatment = optionLabel(
    INITIAL_TREATMENT_OPTIONS,
    form.initialTreatment,
  );
  const witnesses = form.witnesses.trim();

  const opening = sentence([
    person ? `${person} was involved in` : "There was",
    severity ? `a ${severity.toLowerCase()} incident` : "an incident",
    place ? `at ${place}` : "",
    date ? `on ${date}` : "",
    time ? `at ${time}` : "",
  ]);

  const cause = sentence(
    [
      mechanism ? `The mechanism of injury was ${mechanism.toLowerCase()}` : "",
      nature ? `the nature of injury was ${nature.toLowerCase()}` : "",
      object ? `the object involved was ${object}` : "",
    ]
      .filter(Boolean)
      .map((clause, index) => (index === 0 ? clause : `and ${clause}`)),
  );

  const response = sentence([
    treatment ? `Initial treatment was ${treatment.toLowerCase()}` : "",
    form.secondaryTreatment === "Yes" ? "and further treatment was sought" : "",
  ]);

  const observers = sentence([witnesses ? `Witnesses: ${witnesses}` : ""]);

  return [opening, cause, response, observers].filter(Boolean).join(" ");
}

/**
 * Whether there is enough for a draft to be worth offering — and worth paying
 * a model call for.
 *
 * Two facts beyond the person and place, because a draft that only says "there
 * was an incident at Plant A" tells the reporter nothing they did not just
 * type, and asking them to review it wastes more of their attention than it
 * saves.
 */
export function canDraftDescription(form: ReportIncidentFormState): boolean {
  const specifics = [
    form.mechanismOfInjury.trim(),
    form.natureOfInjury.trim(),
    form.objectInvolved.trim(),
    form.initialTreatment.trim(),
  ].filter(Boolean);

  return specifics.length >= 2 && form.incidentDate.trim() !== "";
}
