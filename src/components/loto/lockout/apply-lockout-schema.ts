import type { FormSchema, FormValues } from "@/components/form-builder";

export const LOTO_APPLY_FORM_ID = "loto-apply-lockout-form";

/**
 * Lockout registration fields. There is deliberately no lock-number input:
 * the backend assigns the next per-site number on POST /api/Loto/lockouts and
 * returns it in the response.
 */
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
    expectedCompletion: "",
    purpose: "",
  };
}

export function fieldString(values: FormValues, name: string): string {
  const value = values[name];
  return typeof value === "string" ? value : "";
}
