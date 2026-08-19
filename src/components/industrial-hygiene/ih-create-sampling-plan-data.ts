import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";

export const IH_CREATE_PLAN_PATH = `${IH_BASE_PATH}/sampling-plans/new`;
export const IH_CREATE_PLAN_FORM_ID = "ih-create-sampling-plan";

/** Target hazard agents — Figma 5298:29772. */
export const IH_CREATE_PLAN_AGENT_OPTIONS: readonly SelectOption[] = [
  { value: "benzene", label: "Benzene" },
  { value: "noise", label: "Noise (A-weighted)" },
  { value: "silica", label: "Silica Dust (RCS)" },
  { value: "lead", label: "Lead" },
  { value: "asbestos", label: "Asbestos" },
  { value: "radiation", label: "Ionizing Radiation" },
  { value: "heat", label: "Heat Stress (WBGT)" },
];

/** Target work areas — Figma 5298:29818. */
export const IH_CREATE_PLAN_AREA_OPTIONS: readonly SelectOption[] = [
  { value: "lab-1", label: "Lab 1 – Room 110" },
  { value: "lab-2", label: "Lab 2 – Room 204" },
  { value: "maintenance", label: "Maintenance Shop" },
  { value: "process-a", label: "Process Area A" },
  { value: "process-b", label: "Process Area B" },
  { value: "grinding", label: "Grinding Station" },
  { value: "battery", label: "Battery Room" },
  { value: "boiler", label: "Boiler Room" },
  { value: "fabrication", label: "Fabrication Hall" },
  { value: "assembly", label: "Assembly Line A" },
  { value: "packing", label: "Packing Area" },
];

export const IH_CREATE_PLAN_PEOPLE: readonly SelectOption[] = [
  { value: "sarah-mitchell", label: "Sarah Mitchell" },
  { value: "james-torres", label: "James Torres" },
  { value: "lena-park", label: "Lena Park" },
  { value: "amy-chen", label: "Amy Chen" },
];

export const IH_CREATE_PLAN_FREQUENCIES: readonly SelectOption[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "ad-hoc", label: "Ad-hoc" },
];

export const IH_CREATE_PLAN_METHODS: readonly SelectOption[] = [
  { value: "personal-pbz", label: "Personal PBZ" },
  { value: "area-sample", label: "Area Sample" },
  { value: "noise-dosimetry", label: "Noise Dosimetry" },
  { value: "stel", label: "STEL" },
];

export const IH_CREATE_PLAN_STATUSES: readonly SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "approved", label: "Approved" },
];

/** Create Sampling Plan form — Figma 5298:29449. */
export const createSamplingPlanSchema: FormSchema = [
  {
    type: "text",
    name: "planName",
    label: "Plan Name",
    required: true,
    colSpan: 12,
    placeholder: "e.g. Q3 Noise Survey – Maintenance Areas",
  },
  {
    type: "textarea",
    name: "purpose",
    label: "Purpose / Scope",
    colSpan: 12,
    rows: 3,
    placeholder:
      "Reason for monitoring — baseline, routine, follow-up after exceedance, regulatory requirement…",
  },
  {
    type: "chips",
    name: "agents",
    label: "Target Hazard Agents",
    required: true,
    colSpan: 12,
    options: IH_CREATE_PLAN_AGENT_OPTIONS,
  },
  {
    type: "chips",
    name: "areas",
    label: "Target Work Areas",
    required: true,
    colSpan: 12,
    options: IH_CREATE_PLAN_AREA_OPTIONS,
  },
  {
    type: "select",
    name: "responsiblePerson",
    label: "Responsible Person",
    required: true,
    colSpan: 6,
    placeholder: "Select person…",
    options: IH_CREATE_PLAN_PEOPLE,
  },
  {
    type: "select",
    name: "frequency",
    label: "Sampling Frequency",
    colSpan: 6,
    placeholder: "Select frequency…",
    options: IH_CREATE_PLAN_FREQUENCIES,
  },
  {
    type: "select",
    name: "method",
    label: "Sampling Method",
    colSpan: 6,
    placeholder: "Select method…",
    options: IH_CREATE_PLAN_METHODS,
  },
  {
    type: "select",
    name: "status",
    label: "Plan Status",
    colSpan: 6,
    options: IH_CREATE_PLAN_STATUSES,
  },
  {
    type: "date",
    name: "startDate",
    label: "Start Date",
    colSpan: 6,
  },
  {
    type: "date",
    name: "endDate",
    label: "End Date",
    colSpan: 6,
  },
  {
    type: "textarea",
    name: "notes",
    label: "Additional Notes",
    colSpan: 12,
    rows: 3,
    placeholder: "Lab name, analytical method, chain-of-custody requirements…",
  },
];

export const IH_CREATE_PLAN_INITIAL_VALUES: FormValues = {
  planName: "",
  purpose: "",
  agents: [],
  areas: [],
  responsiblePerson: "",
  frequency: "",
  method: "",
  status: "draft",
  startDate: "",
  endDate: "",
  notes: "",
};
