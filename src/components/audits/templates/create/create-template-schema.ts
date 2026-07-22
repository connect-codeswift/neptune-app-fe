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

/** Shape of step 1, keyed by the schema field names. */
export type CreateTemplateValues = {
  templateName: string;
  templateType: string;
  tags: string[];
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
    placeholder: "e.g. Monthly Fire Safety Audit",
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
  templateType: "Audit",
  tags: ["Safety"],
  description: "",
};
