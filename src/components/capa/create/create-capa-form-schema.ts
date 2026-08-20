import {
  createInitialValues,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";

export const CREATE_CAPA_FORM_ID = "create-capa-form";

/** FormBuilder schema for Create CAPA step 2 — Figma 7123:41554. */
export function buildCreateCapaSchema(): FormSchema {
  return [
    {
      type: "textarea",
      name: "description",
      label: "Action description",
      required: true,
      colSpan: 12,
      rows: 4,
      placeholder: "Describe the corrective / preventive action...",
    },
    {
      type: "tiles",
      name: "type",
      label: "Type",
      required: true,
      colSpan: 12,
      variant: "segmented",
      options: [
        { value: "Corrective", label: "Corrective" },
        { value: "Preventive", label: "Preventive" },
      ],
    },
    {
      type: "person",
      name: "assigned",
      label: "Assigned",
      colSpan: 6,
      usersSource: "dropdown",
      displayNameField: "assignedName",
      placeholder: "e.g. M. Torres",
      excludeSelf: true,
    },
    {
      type: "date",
      name: "dueDate",
      label: "Due date",
      colSpan: 6,
      placeholder: "mm/dd/yyyy",
    },
    {
      type: "tiles",
      name: "priority",
      label: "Priority",
      required: true,
      colSpan: 12,
      variant: "segmented",
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
  ];
}

export function createCreateCapaInitialValues(schema: FormSchema): FormValues {
  return {
    ...createInitialValues(schema),
    type: "Corrective",
    priority: "Medium",
    assigned: "",
    assignedName: "",
    dueDate: "",
    description: "",
  };
}

export function fieldString(values: FormValues, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}
