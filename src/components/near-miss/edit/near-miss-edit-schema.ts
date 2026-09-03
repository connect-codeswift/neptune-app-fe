import {
  CONTRIBUTING_FACTOR_OPTIONS,
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/near-miss/report/near-miss-report-schema";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";
import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";

/** Keep a stored custom type/location in the list so the trigger can show it. */
function withStoredOption(
  options: readonly SelectOption[],
  stored: string,
): SelectOption[] {
  const trimmed = stored.trim();
  if (!trimmed) return [...options];
  if (
    options.some(
      (option) => option.value === trimmed || option.label === trimmed,
    )
  ) {
    return [...options];
  }
  return [...options, { value: trimmed, label: trimmed }];
}

/** Map a stored slug or label back to the option value the select expects. */
function selectValueFor(
  options: readonly SelectOption[],
  stored: string,
): string {
  const trimmed = stored.trim();
  if (!trimmed) return "";
  const byValue = options.find((option) => option.value === trimmed);
  if (byValue) return byValue.value;
  const byLabel = options.find((option) => option.label === trimmed);
  if (byLabel) return byLabel.value;
  return trimmed;
}

/** Shape of a submitted near-miss edit, keyed by the schema field names. */
export type NearMissEditValues = {
  dateOfEvent: string;
  hazardType: string;
  location: string;
  contributingFactors: string[];
  whatHappened: string;
};

export function buildNearMissEditSchema(
  record: NearMissRecord,
  registerLocations: readonly { id: number; name: string }[] = [],
): FormSchema {
  // Locations come from the site register, passed in because a schema cannot hold a hook.
  // withStoredOption keeps whatever the record already carries visible even when it is not in
  // the register - free text from before it existed, or a location since retired - so opening
  // an old record never silently blanks its location.
  const locationRegister = registerLocations.map((entry) => ({
    value: String(entry.id),
    label: entry.name,
  }));
  const typeOptions = withStoredOption(HAZARD_TYPE_OPTIONS, record.hazardType);
  const locationOptions = withStoredOption(locationRegister, record.location);
  const typeValue = selectValueFor(HAZARD_TYPE_OPTIONS, record.hazardType);
  const locationValue = selectValueFor(locationRegister, record.location);
  const factorOptions = record.contributingFactors.reduce(
    (options, factor) => withStoredOption(options, factor),
    [...CONTRIBUTING_FACTOR_OPTIONS],
  );

  return [
    {
      type: "date",
      name: "dateOfEvent",
      label: "Date of Event",
      required: true,
      colSpan: 6,
      // Same bound as the report form — see near-miss-report-schema.
      limit: "not-future",
    },
    {
      type: "select",
      name: "hazardType",
      label: "Hazard type",
      required: true,
      colSpan: 6,
      placeholder: "Select hazard type",
      helperText:
        "The kind of hazard that almost caused harm — used to classify this near miss.",
      options: typeOptions,
      allowCustom: true,
      addCustomLabel: "Add custom hazard type",
      addCustomPlaceholder: "e.g. Confined space entry",
      selectedOption: typeOptions.find((option) => option.value === typeValue),
    },
    {
      type: "select",
      name: "location",
      label: "Location",
      required: true,
      colSpan: 12,
      placeholder: "Select location",
      helperText:
        "Pick the named area. Nearby rooms that are the same space should share one location.",
      options: locationOptions,
      selectedOption: locationOptions.find(
        (option) => option.value === locationValue,
      ),
    },
    {
      type: "chips",
      name: "contributingFactors",
      label: "Contributing Factors (select all that apply)",
      colSpan: 12,
      options: factorOptions,
      allowCustom: true,
      addCustomPlaceholder: "Add another factor…",
    },
    {
      type: "textarea",
      name: "whatHappened",
      label: "What happened?",
      required: true,
      colSpan: 12,
      rows: 4,
      placeholder:
        "Describe what almost happened and what conditions were present...",
    },
  ];
}

export function toNearMissEditValues(
  record: NearMissRecord,
  registerLocations: readonly { id: number; name: string }[] = [],
): FormValues {
  // The stored value is the register name; the field holds the id, so it is resolved here.
  // A record predating the register matches nothing and keeps its text, which withStoredOption
  // has already added to the options.
  const locationRegister = registerLocations.map((entry) => ({
    value: String(entry.id),
    label: entry.name,
  }));

  return {
    dateOfEvent: record.dateOfEvent.slice(0, 10),
    hazardType: selectValueFor(HAZARD_TYPE_OPTIONS, record.hazardType),
    location: selectValueFor(locationRegister, record.location),
    contributingFactors: record.contributingFactors.map((factor) =>
      selectValueFor(CONTRIBUTING_FACTOR_OPTIONS, factor),
    ),
    whatHappened: record.description,
  };
}
