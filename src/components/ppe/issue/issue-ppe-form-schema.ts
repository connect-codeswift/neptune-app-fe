import {
  createInitialValues,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import type { IssuePpeRequestDto } from "@/dtos/req/ppe-request.dto";

export function buildIssuePpeSchema(
  employeeOptions: readonly SelectOption[],
  ppeItemOptions: readonly SelectOption[],
  sizeOptions: readonly SelectOption[],
  isPpeItemSelected: boolean,
): FormSchema {
  const hasSizeOptions = sizeOptions.length > 0;

  return [
    {
      type: "select",
      name: "employee",
      label: "Employee",
      required: true,
      colSpan: 12,
      options: employeeOptions,
      placeholder: "Select employee",
    },
    {
      type: "select",
      name: "ppeItem",
      label: "PPE Item",
      required: true,
      colSpan: 12,
      options: ppeItemOptions,
      placeholder: "Select PPE item",
    },
    {
      type: "text",
      name: "quantity",
      label: "Quantity",
      required: true,
      colSpan: 6,
      inputType: "number",
      placeholder: "1",
    },
    {
      type: "select",
      name: "size",
      label: "Size",
      colSpan: 6,
      options: sizeOptions,
      placeholder: !isPpeItemSelected
        ? "Select PPE item first"
        : hasSizeOptions
          ? "Select size"
          : "No sizes available",
      disabled: !isPpeItemSelected || !hasSizeOptions,
    },
    {
      type: "textarea",
      name: "notes",
      label: "Notes",
      colSpan: 12,
      rows: 3,
      showOptional: true,
      placeholder: "Task context, replacement reason, special instructions…",
    },
    {
      type: "switch",
      name: "employeeAcknowledgement",
      label: "Employee Acknowledgement",
      colSpan: 12,
    },
  ];
}

export function createIssuePpeValues(schema: FormSchema): FormValues {
  return {
    ...createInitialValues(schema),
    quantity: "1",
    employeeAcknowledgement: "true",
  };
}

/** Strongly-typed shape of the issue PPE form. */
export type IssuePpeFormValues = {
  employee: string;
  ppeItem: string;
  quantity: string;
  size: string;
  notes: string;
  employeeAcknowledgement: string;
};

export function isEmployeeAcknowledged(value: string): boolean {
  return value === "true";
}

function labelForOption(
  options: readonly SelectOption[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Map form values to POST /api/ppe/issue payload. */
export function toIssuePpeRequest(
  values: IssuePpeFormValues,
  ppeItemOptions: readonly SelectOption[],
  sizeOptions: readonly SelectOption[],
): IssuePpeRequestDto {
  return {
    assignTo: Number(values.employee) || 0,
    ppeId: Number(values.ppeItem) || 0,
    item: labelForOption(ppeItemOptions, values.ppeItem),
    quantity: Number(values.quantity) || 0,
    size: labelForOption(sizeOptions, values.size),
    note: values.notes.trim(),
  };
}

export const ISSUE_PPE_FORM_ID = "issue-ppe-form";
