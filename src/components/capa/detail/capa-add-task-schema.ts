import {
  createInitialValues,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";

export const CAPA_ADD_TASK_FORM_ID = "capa-add-task-form";

export type CapaAddTaskInitialDraft = Readonly<{
  name?: string;
  dueDate?: string;
  priority?: string;
}>;

/**
 * FormBuilder schema for the CAPA Add Task modal — Figma 5491:23536.
 *
 * `capaDueDate` (ISO `yyyy-mm-dd`) caps the task picker. A task that falls due after the CAPA
 * it belongs to cannot be completed in time to close it, so the deadline is the parent's.
 * Omitted when the CAPA has no due date of its own, which leaves the picker open-ended.
 */
export function buildCapaAddTaskSchema(capaDueDate?: string): FormSchema {
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
      type: "date",
      name: "dueDate",
      label: "Due Date",
      required: true,
      colSpan: 12,
      placeholder: "MM/DD/YYYY",
      // Same rule the API enforces on AddTask — a task cannot open overdue.
      limit: "not-past",
      ...(capaDueDate ? { max: capaDueDate } : {}),
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

export function createCapaAddTaskInitialValues(
  schema: FormSchema,
  draft?: CapaAddTaskInitialDraft,
): FormValues {
  return {
    ...createInitialValues(schema),
    name: draft?.name ?? "",
    dueDate: draft?.dueDate ?? "",
    priority: draft?.priority || "Medium",
  };
}

export function fieldString(values: FormValues, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}
