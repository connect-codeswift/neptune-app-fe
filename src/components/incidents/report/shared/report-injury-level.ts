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
