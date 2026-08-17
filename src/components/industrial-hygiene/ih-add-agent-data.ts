import type {
  FormSchema,
  FormValues,
  SelectOption,
  TileOption,
} from "@/components/form-builder";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  IH_AGENT_ROWS,
  type IhAgentRow,
  type IhAgentTypeLabel,
} from "@/components/industrial-hygiene/ih-agent-library-data";

export const IH_ADD_AGENT_PATH = `${IH_BASE_PATH}/agent-library/new`;
export const IH_ADD_AGENT_FORM_ID = "ih-add-hazard-agent";
export const IH_EDIT_AGENT_FORM_ID = "ih-edit-hazard-agent";

export function ihEditAgentPath(agentId: string): string {
  return `${IH_BASE_PATH}/agent-library/${agentId}/edit`;
}

export const IH_AGENT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "chemical", label: "Chemical" },
  { value: "noise", label: "Noise" },
  { value: "dust", label: "Dust" },
  { value: "radiation", label: "Radiation" },
  { value: "biological", label: "Biological" },
  { value: "thermal", label: "Thermal" },
];

export const IH_AGENT_UNIT_OPTIONS: readonly SelectOption[] = [
  { value: "ppm", label: "ppm" },
  { value: "mg-m3", label: "mg/m³" },
  { value: "ug-m3", label: "µg/m³" },
  { value: "db-a", label: "dB(A)" },
  { value: "f-cc", label: "f/cc" },
  { value: "msv-yr", label: "mSv/yr" },
  { value: "cfu-l", label: "CFU/L" },
  { value: "celsius", label: "°C" },
];

export const IH_AGENT_SDS_OPTIONS: readonly SelectOption[] = [
  { value: "SDS-001", label: "SDS-001" },
  { value: "SDS-002", label: "SDS-002" },
  { value: "SDS-003", label: "SDS-003" },
  { value: "SDS-004", label: "SDS-004" },
  { value: "SDS-005", label: "SDS-005" },
];

export const IH_AGENT_STATUS_OPTIONS: readonly TileOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AGENT_TYPE_VALUE: Record<IhAgentTypeLabel, string> = {
  Chemical: "chemical",
  Noise: "noise",
  Dust: "dust",
  Radiation: "radiation",
  Biological: "biological",
  Thermal: "thermal",
};

const AGENT_UNIT_VALUE: Record<string, string> = {
  ppm: "ppm",
  "mg/m³": "mg-m3",
  "µg/m³": "ug-m3",
  "dB(A)": "db-a",
  "f/cc": "f-cc",
  "mSv/yr": "msv-yr",
  "CFU/L": "cfu-l",
  "°C": "celsius",
};

/** Shared add/edit agent form — Figma 5305:31312 / 5313:31882. */
export const addHazardAgentSchema: FormSchema = [
  {
    type: "text",
    name: "agentName",
    label: "Agent / Substance Name",
    required: true,
    colSpan: 12,
    placeholder: "e.g. Benzene, Crystalline Silica, Noise",
  },
  {
    type: "select",
    name: "agentType",
    label: "Agent Type",
    required: true,
    colSpan: 6,
    placeholder: "Select type…",
    options: IH_AGENT_TYPE_OPTIONS,
  },
  {
    type: "select",
    name: "unit",
    label: "Unit of Measure",
    required: true,
    colSpan: 6,
    placeholder: "Select unit…",
    options: IH_AGENT_UNIT_OPTIONS,
  },
  {
    type: "heading",
    name: "oelHeading",
    label: "Occupational Exposure Limits (OELs)",
    colSpan: 12,
  },
  {
    type: "text",
    name: "oshaPel",
    label: "OSHA PEL (8-hr TWA)",
    colSpan: 6,
    inputType: "number",
    placeholder: "0",
    helperText: "Permissible Exposure Limit — legally enforceable",
  },
  {
    type: "text",
    name: "acgihTlv",
    label: "ACGIH TLV-TWA",
    colSpan: 6,
    inputType: "number",
    placeholder: "0",
    helperText: "Threshold Limit Value — recommended",
  },
  {
    type: "text",
    name: "nioshRel",
    label: "NIOSH REL",
    colSpan: 6,
    inputType: "number",
    placeholder: "0",
    helperText: "Recommended Exposure Limit",
  },
  {
    type: "text",
    name: "internalLimit",
    label: "Internal Limit",
    colSpan: 6,
    inputType: "number",
    placeholder: "0",
    helperText: "Company-defined target (often more stringent)",
  },
  {
    type: "select",
    name: "sdsLink",
    label: "Link to SDS Record (for chemical agents)",
    colSpan: 12,
    placeholder: "Select SDS record…",
    options: IH_AGENT_SDS_OPTIONS,
  },
  {
    type: "textarea",
    name: "notes",
    label: "Notes / Regulatory References",
    colSpan: 12,
    rows: 3,
    placeholder:
      "OSHA standard reference, measurement method (e.g. NIOSH 1501), sampling notes…",
  },
  {
    type: "tiles",
    name: "status",
    label: "Status",
    colSpan: 6,
    columns: 2,
    variant: "segmented",
    options: IH_AGENT_STATUS_OPTIONS,
  },
];

export const IH_ADD_AGENT_INITIAL_VALUES: FormValues = {
  agentName: "",
  agentType: "",
  unit: "",
  oshaPel: "",
  acgihTlv: "",
  nioshRel: "",
  internalLimit: "",
  sdsLink: "",
  notes: "",
  status: "active",
};

export function getIhAgentById(agentId: string): IhAgentRow | null {
  return IH_AGENT_ROWS.find((row) => row.id === agentId) ?? null;
}

export function getIhAgentEditValues(agent: IhAgentRow): FormValues {
  return {
    agentName: agent.name,
    agentType: AGENT_TYPE_VALUE[agent.type],
    unit: AGENT_UNIT_VALUE[agent.unit] ?? "",
    oshaPel: agent.oshaPel,
    acgihTlv: agent.acgihTlv,
    nioshRel: agent.nioshRel,
    internalLimit: agent.internalLimit,
    sdsLink: agent.sdsLink ?? "",
    notes:
      agent.name === "Benzene"
        ? "OSHA 29 CFR 1910.1028; NIOSH 1501 method for air sampling."
        : "",
    status: agent.status === "Active" ? "active" : "inactive",
  };
}
