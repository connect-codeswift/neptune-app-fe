import {
  createInitialValues,
  type FieldConfig,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import type { IssuePpeRequestDto } from "@/dtos/req/ppe-request.dto";

export type IssuePpeEmployeeFieldOptions = Readonly<{
  siteId: number;
  siteName?: string | null;
  /** When true, lock to the current user (non-elevated). */
  disabled: boolean;
  helperText?: string;
}>;

export function buildIssuePpeSchema(
  ppeItemOptions: readonly SelectOption[],
  sizeOptions: readonly SelectOption[],
  isPpeItemSelected: boolean,
  employeeField: IssuePpeEmployeeFieldOptions,
  showEmployeeAcknowledgement = false,
): FormSchema {
  const hasSizeOptions = sizeOptions.length > 0;

  const fields: FieldConfig[] = [
    {
      type: "person",
      name: "employee",
      label: "Employee",
      required: true,
      colSpan: 12,
      siteId: employeeField.siteId,
      siteName: employeeField.siteName,
      displayNameField: "employeeName",
      disabled: employeeField.disabled,
      trailingHint: employeeField.disabled
        ? undefined
        : "Search people at your site.",
      placeholder: "Start typing a name…",
      helperText: employeeField.helperText,
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
  ];

  if (showEmployeeAcknowledgement) {
    fields.push({
      type: "switch",
      name: "employeeAcknowledgement",
      label: "Employee Acknowledgement",
      colSpan: 12,
    });
  }

  return fields;
}

export function createIssuePpeValues(
  schema: FormSchema,
  options: Readonly<{
    showEmployeeAcknowledgement?: boolean;
    employeeUserId?: string;
    employeeName?: string;
  }> = {},
): FormValues {
  const {
    showEmployeeAcknowledgement = false,
    employeeUserId = "",
    employeeName = "",
  } = options;

  return {
    ...createInitialValues(schema),
    quantity: "1",
    employee: employeeUserId,
    employeeName,
    ...(showEmployeeAcknowledgement ? { employeeAcknowledgement: "true" } : {}),
  };
}

/** Strongly-typed shape of the issue PPE form. */
export type IssuePpeFormValues = {
  employee: string;
  employeeName: string;
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
  const sizeValue = values.size.trim();
  const size =
    sizeOptions.length > 0 ? labelForOption(sizeOptions, sizeValue) : sizeValue;

  return {
    assignTo: Number(values.employee) || 0,
    ppeId: Number(values.ppeItem) || 0,
    item: labelForOption(ppeItemOptions, values.ppeItem),
    quantity: Number(values.quantity) || 0,
    size,
    note: values.notes.trim(),
  };
}

export const ISSUE_PPE_FORM_ID = "issue-ppe-form";
