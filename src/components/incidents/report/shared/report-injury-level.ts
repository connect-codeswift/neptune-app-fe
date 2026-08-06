export type InjuryLevelId =
  | "no-injury"
  | "first-aid"
  | "medical-treatment"
  | "lost-time";

export type InjuryLevelOption = Readonly<{
  id: InjuryLevelId;
  label: string;
  description: string;
}>;

export const INJURY_LEVEL_OPTIONS: readonly InjuryLevelOption[] = [
  {
    id: "no-injury",
    label: "No injury",
    description: "No one was hurt",
  },
  {
    id: "first-aid",
    label: "First aid only",
    description: "Treated on-site",
  },
  {
    id: "medical-treatment",
    label: "Medical treatment",
    description: "Off-site care needed",
  },
  {
    id: "lost-time",
    label: "Lost time",
    description: "Could not return to work",
  },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const;

/** Spellings a backend might send, mapped onto the four options above. */
const GENDER_ALIASES: Readonly<Record<string, string>> = {
  m: "Male",
  male: "Male",
  man: "Male",
  f: "Female",
  female: "Female",
  woman: "Female",
  nb: "Non-binary",
  nonbinary: "Non-binary",
  "non-binary": "Non-binary",
  "non binary": "Non-binary",
  other: "Non-binary",
  x: "Prefer not to say",
  na: "Prefer not to say",
  "n/a": "Prefer not to say",
  unknown: "Prefer not to say",
  undisclosed: "Prefer not to say",
  "not disclosed": "Prefer not to say",
  "prefer not to say": "Prefer not to say",
};

/**
 * Reads a gender off a user record onto one of `GENDER_OPTIONS`, or `""` when
 * it can't be placed.
 *
 * Deliberately tolerant about spelling and deliberately refuses to guess at
 * numbers: an integer enum carries no clue which member is which, and silently
 * mapping `1` to "Male" would put a wrong answer on an OSHA-relevant record
 * with nothing to show it was invented. If the API lands with a numeric enum,
 * add the mapping here once its order is confirmed.
 */
export function normalizeGender(raw: unknown): string {
  if (typeof raw !== "string") {
    return "";
  }

  const text = raw.trim();
  if (!text) return "";

  const exact = GENDER_OPTIONS.find(
    (option) => option.value.toLowerCase() === text.toLowerCase(),
  );
  if (exact) return exact.value;

  return GENDER_ALIASES[text.toLowerCase()] ?? "";
}
