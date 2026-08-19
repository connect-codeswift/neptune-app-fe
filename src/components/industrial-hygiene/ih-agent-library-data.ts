export type IhAgentStatus = "Active" | "Closed";

export type IhAgentTypeLabel =
  "Chemical" | "Noise" | "Dust" | "Radiation" | "Biological" | "Thermal";

export type IhAgentRow = Readonly<{
  id: string;
  code: string;
  name: string;
  type: IhAgentTypeLabel;
  typeIcon: string;
  unit: string;
  oshaPel: string;
  acgihTlv: string;
  nioshRel: string;
  internalLimit: string;
  sdsLink: string | null;
  status: IhAgentStatus;
}>;

/** Hazard Agent Library — Figma 5298:28740. */
export const IH_AGENT_ROWS: readonly IhAgentRow[] = [
  {
    id: "ag-1",
    code: "AG-001",
    name: "Benzene",
    type: "Chemical",
    typeIcon: "mdi:flask-outline",
    unit: "ppm",
    oshaPel: "1",
    acgihTlv: "0.5",
    nioshRel: "0.1",
    internalLimit: "0.1",
    sdsLink: "SDS-005",
    status: "Active",
  },
  {
    id: "ag-2",
    code: "AG-002",
    name: "Noise (A-weighted)",
    type: "Noise",
    typeIcon: "mdi:volume-high",
    unit: "dB(A)",
    oshaPel: "90",
    acgihTlv: "85",
    nioshRel: "85",
    internalLimit: "82",
    sdsLink: null,
    status: "Active",
  },
  {
    id: "ag-3",
    code: "AG-003",
    name: "Silica Dust (RCS)",
    type: "Dust",
    typeIcon: "mdi:weather-windy",
    unit: "mg/m³",
    oshaPel: "0.05",
    acgihTlv: "0.025",
    nioshRel: "0.05",
    internalLimit: "0.02",
    sdsLink: null,
    status: "Active",
  },
  {
    id: "ag-4",
    code: "AG-004",
    name: "Lead",
    type: "Chemical",
    typeIcon: "mdi:flask-outline",
    unit: "µg/m³",
    oshaPel: "50",
    acgihTlv: "20",
    nioshRel: "50",
    internalLimit: "20",
    sdsLink: null,
    status: "Active",
  },
  {
    id: "ag-5",
    code: "AG-005",
    name: "Asbestos",
    type: "Dust",
    typeIcon: "mdi:weather-windy",
    unit: "f/cc",
    oshaPel: "0.1",
    acgihTlv: "0.1",
    nioshRel: "0.1",
    internalLimit: "0.1",
    sdsLink: null,
    status: "Active",
  },
  {
    id: "ag-6",
    code: "AG-006",
    name: "Ionizing Radiation",
    type: "Radiation",
    typeIcon: "mdi:pulse",
    unit: "mSv/yr",
    oshaPel: "50",
    acgihTlv: "20",
    nioshRel: "50",
    internalLimit: "15",
    sdsLink: null,
    status: "Active",
  },
  {
    id: "ag-7",
    code: "AG-007",
    name: "Legionella",
    type: "Biological",
    typeIcon: "mdi:bacteria-outline",
    unit: "CFU/L",
    oshaPel: "0",
    acgihTlv: "0",
    nioshRel: "0",
    internalLimit: "0",
    sdsLink: null,
    status: "Closed",
  },
  {
    id: "ag-8",
    code: "AG-008",
    name: "Heat Stress (WBGT)",
    type: "Thermal",
    typeIcon: "mdi:thermometer",
    unit: "°C",
    oshaPel: "28",
    acgihTlv: "28",
    nioshRel: "28",
    internalLimit: "27",
    sdsLink: null,
    status: "Active",
  },
];
