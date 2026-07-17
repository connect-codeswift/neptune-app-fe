export const INITIAL_TREATMENT_OPTIONS = [
  {
    value: "minor-clinic",
    label: "Minor clinic/hospital medical remedies and diagnostic testing",
  },
  { value: "first-aid-on-site", label: "First aid on site" },
  { value: "none", label: "None" },
  { value: "emergency", label: "Emergency care / ER" },
] as const;

export const MECHANISM_OPTIONS = [
  { value: "equipment-failure", label: "Equipment Failure" },
  { value: "slip-trip-fall", label: "Slip / trip / fall" },
  { value: "struck-by", label: "Struck by object" },
  { value: "caught-in", label: "Caught in / between" },
  { value: "other", label: "Other" },
] as const;

export const NATURE_OF_INJURY_OPTIONS = [
  { value: "laceration", label: "Laceration / cut" },
  { value: "bruise", label: "Bruise / contusion" },
  { value: "sprain", label: "Sprain / strain" },
  { value: "burn", label: "Burn" },
  { value: "none", label: "No injury" },
] as const;
