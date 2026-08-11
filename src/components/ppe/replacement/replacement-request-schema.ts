import {
  createInitialValues,
  type FormSchema,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import type { ReplacePpeRequestDto } from "@/dtos/req/ppe-request.dto";

/** value === label so the form stores the API's replaceReason text. */
const REPLACEMENT_REASON_OPTIONS: readonly SelectOption[] = [
  { value: "Damage / Impact", label: "Damage / Impact" },
  { value: "Chemical Contamination", label: "Chemical Contamination" },
  { value: "Wear / End of Life", label: "Wear / End of Life" },
  { value: "Loss / Stolen", label: "Loss / Stolen" },
  { value: "Inspection Failure", label: "Inspection Failure" },
  { value: "Size Change Required", label: "Size Change Required" },
  { value: "Other", label: "Other" },
];

export type ReplacementRequestFormValues = FormValues & {
  employeeId: string;
  issuePpeId: string;
  reasons: string[];
  urgency: string;
  details: string;
  photos: string[];
};

export function buildReplacementRequestSchema(
  employeeOptions: readonly SelectOption[],
  itemOptions: readonly SelectOption[],
): FormSchema {
  return [
    {
      type: "select",
      name: "employeeId",
      label: "Your Name",
      required: true,
      colSpan: 12,
      disabled: true,
      options: employeeOptions,
      placeholder: employeeOptions.length === 0 ? "Select employee" : undefined,
    },
    {
      type: "select",
      name: "issuePpeId",
      label: "PPE Item to Replace",
      required: true,
      colSpan: 12,
      options: itemOptions,
      placeholder:
        itemOptions.length === 0 ? "No PPE items available" : "Select PPE item",
    },
    {
      type: "chips",
      name: "reasons",
      label: "Reason for Replacement",
      required: true,
      colSpan: 12,
      options: REPLACEMENT_REASON_OPTIONS,
    },
    {
      type: "tiles",
      name: "urgency",
      label: "Urgency",
      required: true,
      colSpan: 12,
      columns: 3,
      variant: "segmented",
      options: [
        { value: "Normal", label: "Normal" },
        { value: "High", label: "High" },
        { value: "Emergency", label: "Emergency" },
      ],
    },
    {
      type: "textarea",
      name: "details",
      label: "Additional Details",
      colSpan: 12,
      rows: 3,
      placeholder: "Describe the damage or reason in more detail…",
    },
    {
      type: "photo",
      name: "photos",
      label: "Photo Evidence",
      colSpan: 12,
      optionalHint: "(optional but recommended)",
      optionalHintClassName: "text-[#3b82f6]",
      placeholder: "Add photo of damaged item",
      maxFiles: 1,
    },
  ];
}

export function createReplacementRequestValues(
  schema: FormSchema,
  options: Readonly<{
    employeeId: string;
    issuePpeId?: string;
  }>,
): FormValues {
  return {
    ...createInitialValues(schema),
    employeeId: options.employeeId,
    issuePpeId: options.issuePpeId ?? "",
    urgency: "Normal",
  };
}

export function toReplacePpeRequest(
  values: ReplacementRequestFormValues,
): ReplacePpeRequestDto | { error: string } {
  const issuePpeId = Number(String(values.issuePpeId).trim());
  if (!Number.isFinite(issuePpeId) || issuePpeId <= 0) {
    return { error: "Select a PPE item to replace." };
  }

  const reasons = Array.isArray(values.reasons) ? values.reasons : [];
  const replaceReason = String(reasons[0] ?? "").trim();
  if (!replaceReason) {
    return { error: "Select a reason for replacement." };
  }

  const urgency = String(values.urgency ?? "").trim();
  if (!urgency) {
    return { error: "Select an urgency level." };
  }

  const detail = String(values.details ?? "").trim();
  const photos = Array.isArray(values.photos) ? values.photos : [];
  const evidenceLink = String(photos[0] ?? "").trim();

  const payload: ReplacePpeRequestDto = {
    issuePpeId,
    replaceReason,
    urgency,
  };

  if (detail) payload.detail = detail;
  if (evidenceLink) payload.evidenceLink = evidenceLink;

  return payload;
}

export const REPLACEMENT_REQUEST_FORM_ID = "ppe-replacement-request-form";
