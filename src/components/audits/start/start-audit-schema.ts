import type {
  FormSchema,
  SelectOption,
  SelectPagination,
} from "@/components/form-builder";

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

export type StartAuditSchemaOptions = Readonly<{
  /** Auditors from GET /User/dropdown. */
  auditorOptions: readonly SelectOption[];
  /** Templates for the current page of GET /AuditTemplate/GetAll. */
  templateOptions: readonly SelectOption[];
  /** Prev/next paging for the template dropdown, when more than one page. */
  templatePagination?: SelectPagination;
  /** Preselected template (via "Use template"), so its label shows even when
   * it isn't on the loaded page. */
  selectedTemplateOption?: SelectOption;
}>;

/**
 * Auditors and templates come from APIs, so the schema is built per render
 * rather than declared as a module constant.
 */
export function buildStartAuditSchema(
  options: StartAuditSchemaOptions,
): FormSchema {
  const {
    auditorOptions,
    templateOptions,
    templatePagination,
    selectedTemplateOption,
  } = options;

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
      options: templateOptions,
      pagination: templatePagination,
      selectedOption: selectedTemplateOption,
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
      // allowCustom: true,
      // addCustomLabel: "Add external auditor",
      // addCustomPlaceholder: "e.g. NFPA · Beacon",
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
