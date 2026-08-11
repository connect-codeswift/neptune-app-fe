import {
  createInitialValues,
  type FieldConfig,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";

export const CAPA_ADD_TASK_FORM_ID = "capa-add-task-form";

export type CapaAddTaskFormOptions = Readonly<{
  siteId: number;
  siteName?: string | null;
}>;

/** FormBuilder schema for CAPA detail Add Task modal — Figma 5491:23536. */
export function buildCapaAddTaskSchema(
  options: CapaAddTaskFormOptions,
): FormSchema {
  const fields: FieldConfig[] = [
    {
      type: "text",
      name: "name",
      label: "Task Name",
      required: true,
      colSpan: 12,
      placeholder:
        "Perform post-installation inspection of structural acrylic shield",
    },
    {
      type: "textarea",
      name: "description",
      label: "Description",
      colSpan: 12,
      rows: 4,
      placeholder:
        "Detail the measurements, testing conditions, and confirm safety trigger limit compliance...",
    },
    {
      type: "person",
      name: "assigned",
      label: "Assigned To",
      required: true,
      colSpan: 6,
      siteId: options.siteId,
      siteName: options.siteName,
      displayNameField: "assignedName",
      placeholder: "Select assignee",
    },
    {
      type: "date",
      name: "dueDate",
      label: "Due Date",
      required: true,
      colSpan: 6,
      placeholder: "MM/DD/YYYY",
    },
    {
      type: "tiles",
      name: "priority",
      label: "Priority",
      colSpan: 12,
      variant: "segmented-fill",
      options: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
  ];

  return fields;
}

export function createCapaAddTaskInitialValues(schema: FormSchema): FormValues {
  return {
    ...createInitialValues(schema),
    name: "",
    description: "",
    assigned: "",
    assignedName: "",
    dueDate: "",
    priority: "Medium",
  };
}

export function fieldString(values: FormValues, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}
