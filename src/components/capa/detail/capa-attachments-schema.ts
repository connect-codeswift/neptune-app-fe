import type { FormSchema } from "@/components/form-builder";

const CAPA_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

/** FormBuilder schema for CAPA Attachments tab — Figma 1370:5176. */
export const CAPA_ATTACHMENTS_SCHEMA: FormSchema = [
  {
    type: "photo",
    name: "attachments",
    label: "Attachments",
    hideLabel: true,
    colSpan: 12,
    accept: "files",
    listVariant: "rows",
    maxFiles: 10,
    maxBytes: CAPA_ATTACHMENT_MAX_BYTES,
    placeholder: "Drop files here or click to upload",
    helperText:
      "Photos, signed forms, test results, reports — JPG, PNG, PDF, DOC up to 25 MB",
  },
];

export const CAPA_ATTACHMENTS_FORM_ID = "capa-attachments-form";
