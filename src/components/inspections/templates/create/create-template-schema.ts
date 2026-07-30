import type { FormSchema, SelectOption } from "@/components/form-builder";

export const TEMPLATE_TAG_OPTIONS: readonly SelectOption[] = [
  { value: "Safety", label: "Safety" },
  { value: "Fire", label: "Fire" },
  { value: "Equipment", label: "Equipment" },
  { value: "Environment", label: "Environment" },
  { value: "Compliance", label: "Compliance" },
  { value: "Electrical", label: "Electrical" },
  { value: "Chemical", label: "Chemical" },
  { value: "Other", label: "Other" },
];

/** How often the inspection recurs; sent as the payload's `frequency`. */
export const FREQUENCY_OPTIONS: readonly SelectOption[] = [
  { value: "OneOff", label: "OneOff" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Yearly", label: "Yearly" },
];

/** Shape of step 1, keyed by the schema field names. */
export type CreateTemplateValues = {
  templateName: string;
  templateType: string;
  tags: string[];
  frequency: string;
  description: string;
};

/** Step 1 of the wizard — Basic Information. */
export const createTemplateSchema: FormSchema = [
  {
    type: "text",
    name: "templateName",
    label: "Template Name",
    required: true,
    colSpan: 12,
    maxLength: 100,
    placeholder: "e.g. Monthly Fire Safety Inspection",
  },
  {
    type: "text",
    name: "templateType",
    label: "Template Type",
    colSpan: 12,
    readOnly: true,
    note: "(auto-filled · read-only)",
  },
  {
    type: "chips",
    name: "tags",
    label: "Category / Tags",
    colSpan: 12,
    options: TEMPLATE_TAG_OPTIONS,
    allowCustom: true,
    addCustomPlaceholder: "Add custom tag...",
  },
  {
    type: "select",
    name: "frequency",
    label: "Frequency",
    required: true,
    colSpan: 12,
    placeholder: "Select frequency",
    options: FREQUENCY_OPTIONS,
  },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    colSpan: 12,
    rows: 5,
    maxLength: 500,
    helperText: "Optional",
    placeholder: "Briefly describe what this template is used for.",
  },
];

/** Step 1 opens with the type pre-filled and Safety pre-selected. */
export const createTemplateInitialValues = {
  templateName: "",
  templateType: "Inspection",
  tags: ["Safety"],
  frequency: "",
  description: "",
};
