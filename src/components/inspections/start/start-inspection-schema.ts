import type { FormSchema, SelectOption } from "@/components/form-builder";

/** Sites an inspection can be scheduled against, matching the inspection register. */
const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "all", label: "All" },
  { value: "plant-a", label: "Plant A" },
  { value: "plant-b", label: "Plant B" },
  { value: "warehouse-1", label: "Warehouse 1" },
];

/** Shape of a submitted Start Inspection form, keyed by the schema field names. */
export type StartInspectionValues = {
  inspectionTitle: string;
  template: string;
  location: string;
  inspector: string;
  scheduledDate: string;
};

export type StartInspectionSchemaOptions = Readonly<{
  /** Inspectors from GET /User/dropdown. */
  inspectorOptions: readonly SelectOption[];
  /** Templates available to pick from. */
  templateOptions: readonly SelectOption[];
  /** Arrived via "Use template" — the choice is fixed, so lock the dropdown. */
  isTemplateLocked?: boolean;
}>;

/**
 * Inspectors and templates come from APIs, so the schema is built per render
 * rather than declared as a module constant.
 */
export function buildStartInspectionSchema(
  options: StartInspectionSchemaOptions,
): FormSchema {
  const {
    inspectorOptions,
    templateOptions,
    isTemplateLocked = false,
  } = options;

  return [
    {
      type: "text",
      name: "inspectionTitle",
      label: "Inspection Title",
      required: true,
      colSpan: 12,
      placeholder: "e.g., Q1 Production Safety Inspection",
    },
    {
      type: "select",
      name: "template",
      label: "Template",
      required: true,
      colSpan: 6,
      placeholder: "Select template",
      options: templateOptions,
      disabled: isTemplateLocked,
    },
    {
      type: "select",
      name: "location",
      label: "Location",
      required: true,
      colSpan: 6,
      placeholder: "Select location",
      options: LOCATION_OPTIONS,
      allowCustom: true,
      addCustomLabel: "Add custom location",
      addCustomPlaceholder: "e.g. Plant C · Loading Dock 2",
    },
    {
      type: "select",
      name: "inspector",
      label: "Inspector",
      required: true,
      colSpan: 6,
      placeholder: "Select inspector",
      options: inspectorOptions,
      // External inspectors aren't in the user directory.
      allowCustom: true,
      addCustomLabel: "Add external inspector",
      addCustomPlaceholder: "e.g. NFPA · Beacon",
    },
    {
      type: "date",
      name: "scheduledDate",
      label: "Scheduled Date",
      required: true,
      colSpan: 6,
    },
  ];
}
