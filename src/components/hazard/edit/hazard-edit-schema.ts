import { HAZARD_TYPE_OPTIONS } from "@/components/hazard/report/hazard-report-schema";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";

/** Hazard types keyed by their label — records store the label, not a slug. */
const HAZARD_TYPE_LABEL_OPTIONS: readonly SelectOption[] =
  HAZARD_TYPE_OPTIONS.map((option) => ({
    value: option.label,
    label: option.label,
  }));

const STATUS_OPTIONS: readonly SelectOption[] = [
  { value: "Open", label: "Open" },
  { value: "Investigating", label: "Investigating" },
  { value: "Closed", label: "Closed" },
];

/** Shape of a submitted hazard edit, keyed by the schema field names. */
export type HazardEditValues = {
  hazardType: string;
  status: string;
  /** User id from the dropdown, as a string; "" when unassigned. */
  assignedTo: string;
  description: string;
};

/**
 * Assignees come from GET /User/dropdown, so the schema is built per render
 * rather than declared as a module constant.
 */
export function buildHazardEditSchema(
  assigneeOptions: readonly SelectOption[],
): FormSchema {
  return [
    {
      type: "select",
      name: "hazardType",
      label: "Hazard Type",
      required: true,
      colSpan: 6,
      placeholder: "Select hazard type",
      options: HAZARD_TYPE_LABEL_OPTIONS,
      allowCustom: true,
      addCustomLabel: "Add custom hazard type",
      addCustomPlaceholder: "e.g. Confined space entry",
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
      type: "select",
      name: "assignedTo",
      label: "Assigned To",
      colSpan: 12,
      placeholder: "Select assignee",
      options: assigneeOptions,
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
export function toHazardEditValues(record: HazardRecord): FormValues {
  return {
    hazardType: record.hazardType,
    status: record.status,
    assignedTo: record.assignedToId ? String(record.assignedToId) : "",
    description: record.description,
  };
}
