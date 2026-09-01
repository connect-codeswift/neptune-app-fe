import type { WitnessRow } from "@/components/incidents/detail/incident-detail-types";

/**
 * Validation for the People tab edit scope.
 *
 * Only three fields are editable here — body part, treatment and days away —
 * plus witnesses appended during this edit. Witnesses already on the record
 * belong to the incident report module and are locked, so they are never
 * validated: a legacy row saved with a blank name must not block an unrelated
 * edit made here.
 */

/** Upper bound on days away — ~10 years, past which the entry is a typo. */
const MAX_DAYS_AWAY = 3650;

export type PeopleEditErrors = Readonly<{
  bodyPart: string | null;
  treatment: string | null;
  daysAway: string | null;
  /** Indexed to match the witnesses array; `null` where the row is valid. */
  witnesses: readonly (string | null)[];
}>;

export type PeopleEditDraftInput = Readonly<{
  bodyPart: string;
  treatment: string;
  daysAway: string;
  witnesses: readonly WitnessRow[];
  /** Count of pre-existing witnesses, which are locked and not validated. */
  lockedWitnessCount: number;
}>;

export const NO_PEOPLE_EDIT_ERRORS: PeopleEditErrors = {
  bodyPart: null,
  treatment: null,
  daysAway: null,
  witnesses: [],
};

/** The detail mapper renders "not recorded" as an em dash; it is not a value. */
function isBlank(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed === "—";
}

function validateDaysAway(value: string): string | null {
  const trimmed = value.trim();
  if (isBlank(trimmed)) {
    return "Enter days away — use 0 if no time was lost.";
  }
  if (!/^\d+$/.test(trimmed)) {
    return "Days away must be a whole number.";
  }
  if (Number(trimmed) > MAX_DAYS_AWAY) {
    return `Days away cannot exceed ${String(MAX_DAYS_AWAY)}.`;
  }
  return null;
}

function validateWitness(witness: WitnessRow): string | null {
  if (isBlank(witness.name)) {
    return "Enter the witness name, or remove this row.";
  }
  if (isBlank(witness.role)) {
    return "Enter the witness role.";
  }
  return null;
}

function validateWitnesses(
  witnesses: readonly WitnessRow[],
  lockedWitnessCount: number,
): readonly (string | null)[] {
  return witnesses.map((witness, index) =>
    index < lockedWitnessCount ? null : validateWitness(witness),
  );
}

export function validatePeopleEditDraft(
  draft: PeopleEditDraftInput,
): PeopleEditErrors {
  return {
    bodyPart: isBlank(draft.bodyPart) ? "Enter the affected body part." : null,
    treatment: isBlank(draft.treatment)
      ? "Enter the treatment given, or “None required”."
      : null,
    daysAway: validateDaysAway(draft.daysAway),
    witnesses: validateWitnesses(draft.witnesses, draft.lockedWitnessCount),
  };
}

export function hasPeopleEditErrors(errors: PeopleEditErrors): boolean {
  return (
    errors.bodyPart != null ||
    errors.treatment != null ||
    errors.daysAway != null ||
    errors.witnesses.some((message) => message != null)
  );
}

/** First message, for the toast that accompanies the inline field errors. */
export function firstPeopleEditError(errors: PeopleEditErrors): string | null {
  const witnessError = errors.witnesses.find((message) => message != null);
  return (
    errors.bodyPart ??
    errors.treatment ??
    errors.daysAway ??
    witnessError ??
    null
  );
}

/** Parses an already-validated days-away string for the closure payload. */
export function parseDaysAway(value: string): number {
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : 0;
}
