import {
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/hazard/report/hazard-report-schema";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: "Open", label: "Open" },
  { value: "Investigating", label: "Investigating" },
  { value: "Closed", label: "Closed" },
];

/** Shape of a submitted hazard edit, keyed by the schema field names. */
export type HazardEditValues = {
  hazardType: string;
  location: string;
  status: string;
  description: string;
};

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

/**
 * Assignees come from the org person picker. Custom type/location values from
 * create are appended so they still appear on edit.
 */
export function buildHazardEditSchema(
  record: HazardRecord,
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

  return [
    {
      type: "select",
      name: "hazardType",
      label: "Hazard Type",
      required: true,
      colSpan: 6,
      placeholder: "Select hazard type",
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
      colSpan: 6,
      placeholder: "Select location",
      options: locationOptions,
      allowCustom: true,
      addCustomLabel: "Add custom location",
      addCustomPlaceholder: "e.g. Plant C · Loading Dock 2",
      selectedOption: locationOptions.find(
        (option) => option.value === locationValue,
      ),
    },
    {
      type: "select",
      name: "status",
      label: "Status",
      required: true,
      colSpan: 6,
      placeholder: "Select status",
      options: STATUS_OPTIONS,
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      required: true,
      colSpan: 12,
      rows: 4,
      placeholder: "Describe the hazard in detail.",
    },
  ];
}

/** Pre-fill the edit form from an existing record. */
export function toHazardEditValues(
  record: HazardRecord,
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
    hazardType: selectValueFor(HAZARD_TYPE_OPTIONS, record.hazardType),
    location: selectValueFor(locationRegister, record.location),
    status: record.status,
    description: record.description,
  };
}
