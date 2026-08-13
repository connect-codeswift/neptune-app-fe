export type IhMonitoringStatus = "Below Limit" | "Exceeded";

export type IhMonitoringRow = Readonly<{
  id: string;
  code: string;
  agent: string;
  sampleType: string;
  employee: string;
  workArea: string;
  method: string;
  resultValue: string;
  resultUnit: string;
  oel: string;
  status: IhMonitoringStatus;
  date: string;
}>;

/** Monitoring Records — Figma 5313:32289. */
export const IH_MONITORING_ROWS: readonly IhMonitoringRow[] = [
  {
    id: "mr-1",
    code: "MR-001",
    agent: "Benzene",
    sampleType: "Full-shift TWA",
    employee: "Carlos Reyes",
    workArea: "Process Area B",
    method: "Personal PBZ",
    resultValue: "0.08",
    resultUnit: "ppm",
    oel: "0.5 ppm",
    status: "Below Limit",
    date: "2026-05-12",
  },
  {
    id: "mr-2",
    code: "MR-002",
    agent: "Noise (A-weighted)",
    sampleType: "Full-shift TWA",
    employee: "Tom Bradley",
    workArea: "Maintenance Shop",
    method: "Noise Dosimetry",
    resultValue: "87",
    resultUnit: "dB(A)",
    oel: "85 dB(A)",
    status: "Below Limit",
    date: "2026-05-10",
  },
  {
    id: "mr-3",
    code: "MR-003",
    agent: "Silica Dust (RCS)",
    sampleType: "Full-shift TWA",
    employee: "Group Sample",
    workArea: "Grinding Station",
    method: "Area Sample",
    resultValue: "0.07",
    resultUnit: "mg/m³",
    oel: "0.05 mg/m³",
    status: "Exceeded",
    date: "2026-04-28",
  },
  {
    id: "mr-4",
    code: "MR-004",
    agent: "Lead",
    sampleType: "Full-shift TWA",
    employee: "Sam Okafor",
    workArea: "Battery Room",
    method: "Personal PBZ",
    resultValue: "18",
    resultUnit: "µg/m³",
    oel: "50 µg/m³",
    status: "Below Limit",
    date: "2026-05-01",
  },
  {
    id: "mr-5",
    code: "MR-005",
    agent: "Benzene",
    sampleType: "STEL",
    employee: "Amy Chen",
    workArea: "Lab 2",
    method: "Personal PBZ",
    resultValue: "1.2",
    resultUnit: "ppm",
    oel: "1 ppm",
    status: "Exceeded",
    date: "2026-05-05",
  },
  {
    id: "mr-6",
    code: "MR-006",
    agent: "Heat Stress (WBGT)",
    sampleType: "1-hour STEL",
    employee: "Area Sample",
    workArea: "Boiler Room",
    method: "Area Sample",
    resultValue: "26",
    resultUnit: "°C",
    oel: "28 °C",
    status: "Below Limit",
    date: "2026-06-01",
  },
];
