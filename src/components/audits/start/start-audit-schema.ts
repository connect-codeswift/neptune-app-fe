import { AUDIT_TEMPLATES } from "@/app/dashboard/audits/templates/audit-templates-data";
import type { FormSchema, SelectOption } from "@/components/form-builder";

const TEMPLATE_OPTIONS: readonly SelectOption[] = AUDIT_TEMPLATES.map(
  (template) => ({ value: template.id, label: template.title }),
);

/** Sites an audit can be scheduled against, matching the audit register. */
const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "all", label: "All" },
  { value: "plant-a", label: "Plant A" },
  { value: "plant-b", label: "Plant B" },
  { value: "warehouse-1", label: "Warehouse 1" },
];

/** Shape of a submitted Start Audit form, keyed by the schema field names. */
export type StartAuditValues = {
  auditTitle: string;
  template: string;
  location: string;
  auditor: string;
  scheduledDate: string;
};

/**
 * Auditors come from GET /User/dropdown, so the schema is built per render
 * rather than declared as a module constant.
 */
export function buildStartAuditSchema(
  auditorOptions: readonly SelectOption[],
): FormSchema {
  return [
    {
      type: "text",
      name: "auditTitle",
      label: "Audit Title",
      required: true,
      colSpan: 12,
      placeholder: "e.g., Q1 Production Safety Audit",
    },
    {
      type: "select",
      name: "template",
      label: "Template",
      required: true,
      colSpan: 6,
      placeholder: "Select template",
      options: TEMPLATE_OPTIONS,
    },
    {
      type: "select",
      name: "location",
      label: "Location",
      required: true,
      colSpan: 6,
      placeholder: "Select location",
      options: LOCATION_OPTIONS,
      allowCustom: true,
      addCustomLabel: "Add custom location",
      addCustomPlaceholder: "e.g. Plant C · Loading Dock 2",
    },
    {
      type: "select",
      name: "auditor",
      label: "Auditor",
      required: true,
      colSpan: 6,
      placeholder: "Select auditor",
      options: auditorOptions,
      // External auditors aren't in the user directory.
      allowCustom: true,
      addCustomLabel: "Add external auditor",
      addCustomPlaceholder: "e.g. NFPA · Beacon",
    },
    {
      type: "date",
      name: "scheduledDate",
      label: "Scheduled Date",
      required: true,
      colSpan: 6,
    },
  ];
}
