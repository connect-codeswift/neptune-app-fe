import type { FormSchema, FormValues } from "@/components/form-builder";

export const LOTO_APPLY_FORM_ID = "loto-apply-lockout-form";

export function buildApplyLockoutSchema(): FormSchema {
  return [
    {
      name: "operator",
      type: "text",
      label: "Operator (You)",
      readOnly: true,
      colSpan: 6,
    },
    {
      name: "lockNumber",
      type: "text",
      label: "Lock Number *",
      placeholder: "e.g., LK-055",
      required: true,
      colSpan: 6,
    },
    {
      name: "expectedCompletion",
      type: "date",
      label: "Expected Completion",
      colSpan: 6,
    },
    {
      name: "purpose",
      type: "text",
      label: "Purpose of Work *",
      placeholder: "e.g., Belt replacement",
      required: true,
      colSpan: 6,
    },
  ];
}

export function toApplyLockoutFormValues(operatorName: string): FormValues {
  return {
    operator: operatorName,
    lockNumber: "",
    expectedCompletion: "",
    purpose: "",
  };
}

export function fieldString(values: FormValues, name: string): string {
  const value = values[name];
  return typeof value === "string" ? value : "";
}
