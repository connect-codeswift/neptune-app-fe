import type { FormSchema, SelectOption } from "@/components/form-builder";

/** Sites an inspection can be scheduled against, matching the inspection register. */
const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "all", label: "All" },
  { value: "plant-a", label: "Plant A" },
  { value: "plant-b", label: "Plant B" },
  { value: "warehouse-1", label: "Warehouse 1" },
];

/** Shape of a submitted Schedule Inspection form, keyed by the schema field names. */
export type StartInspectionValues = {
  inspectionTitle: string;
  template: string;
  location: string;
  inspector: string;
  scheduledDate: string;
  dueDate: string;
};

export type StartInspectionSchemaOptions = Readonly<{
  /** Templates available to pick from. */
  templateOptions: readonly SelectOption[];
  /** Arrived via "Use template" — the choice is fixed, so lock the dropdown. */
  isTemplateLocked?: boolean;
}>;

/**
 * Templates come from an API, so the schema is built per render rather than
 * declared as a module constant. The inspector field fetches its own people.
 */
export function buildStartInspectionSchema(
  options: StartInspectionSchemaOptions,
): FormSchema {
  const { templateOptions, isTemplateLocked = false } = options;

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
      colSpan: 12,
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
      type: "person",
      name: "inspector",
      label: "Inspector",
      required: true,
      colSpan: 6,
      placeholder: "Search for an inspector…",
      // Org-wide: an inspector is often from another site.
      usersSource: "org",
      // External inspectors aren't in the user directory, so a typed name is
      // kept rather than cleared. It files no id, which is the same thing the
      // old "add external inspector" option did.
      allowFreeText: true,
    },
    {
      type: "date",
      name: "scheduledDate",
      label: "Scheduled Date",
      required: true,
      colSpan: 6,
      // Scheduled, not recorded — same rule as Start Audit.
      limit: "not-past",
    },
    {
      type: "date",
      name: "dueDate",
      label: "Due Date",
      required: false,
      colSpan: 6,
      // Same rule as scheduledDate above — a due date cannot open overdue.
      limit: "not-past",
    },
  ];
}
