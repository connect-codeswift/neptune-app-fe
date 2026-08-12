import {
  createInitialValues,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";

export const CAPA_ADD_TASK_FORM_ID = "capa-add-task-form";

/** FormBuilder schema for CAPA Add Task modal — Figma 5491:23536. */
export function buildCapaAddTaskSchema(): FormSchema {
  return [
    {
      type: "text",
      name: "name",
      label: "Task Name",
      required: true,
      colSpan: 12,
      placeholder: "Describe the task action...",
    },
    {
      type: "person",
      name: "assigned",
      label: "Assigned To",
      required: true,
      colSpan: 6,
      usersSource: "dropdown",
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
}

export function createCapaAddTaskInitialValues(schema: FormSchema): FormValues {
  return {
    ...createInitialValues(schema),
    name: "",
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
