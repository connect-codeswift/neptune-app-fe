import { IH_AGENT_ROWS } from "@/components/industrial-hygiene/ih-agent-library-data";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  IH_MONITORING_ROWS,
  type IhMonitoringRow,
  type IhMonitoringStatus,
} from "@/components/industrial-hygiene/ih-monitoring-records-data";

export const IH_MONITORING_RECORDS_PATH = `${IH_BASE_PATH}/monitoring-records`;

export function ihMonitoringRecordPath(recordId: string): string {
  return `${IH_MONITORING_RECORDS_PATH}/${recordId}`;
}

export type IhOelStandardRow = Readonly<{
  id: string;
  standard: string;
  limit: string;
  unit: string;
  percentOfLimit: number;
}>;

export type IhMonitoringDetail = Readonly<{
  id: string;
  code: string;
  agent: string;
  employee: string;
  workArea: string;
  method: string;
  sampleDuration: string;
  sampleDate: string;
  laboratory: string;
  linkedPlan: string;
  resultValue: string;
  resultUnit: string;
  status: IhMonitoringStatus;
  actionLevel: string;
  oelLimit: string;
  oelRows: readonly IhOelStandardRow[];
  hasAttachments: boolean;
  capaMessage: string;
}>;

function parseNum(value: string): number {
  return Number.parseFloat(value);
}

function percentOf(result: number, limit: number): number {
  if (!Number.isFinite(result) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }
  return Math.round((result / limit) * 100);
}

function oelRowsFor(
  resultValue: string,
  unit: string,
  oshaPel: string,
  acgihTlv: string,
  nioshRel: string,
  internalLimit: string,
): IhOelStandardRow[] {
  const result = parseNum(resultValue);
  return [
    {
      id: "osha",
      standard: "OSHA PEL",
      limit: oshaPel,
      unit,
      percentOfLimit: percentOf(result, parseNum(oshaPel)),
    },
    {
      id: "acgih",
      standard: "ACGIH TLV-TWA",
      limit: acgihTlv,
      unit,
      percentOfLimit: percentOf(result, parseNum(acgihTlv)),
    },
    {
      id: "niosh",
      standard: "NIOSH REL",
      limit: nioshRel,
      unit,
      percentOfLimit: percentOf(result, parseNum(nioshRel)),
    },
    {
      id: "internal",
      standard: "Internal Limit",
      limit: internalLimit,
      unit,
      percentOfLimit: percentOf(result, parseNum(internalLimit)),
    },
  ];
}

function agentLimits(agentName: string): {
  oshaPel: string;
  acgihTlv: string;
  nioshRel: string;
  internalLimit: string;
  unit: string;
} | null {
  const agent = IH_AGENT_ROWS.find((row) => row.name === agentName);
  if (!agent) return null;
  return {
    oshaPel: agent.oshaPel,
    acgihTlv: agent.acgihTlv,
    nioshRel: agent.nioshRel,
    internalLimit: agent.internalLimit,
    unit: agent.unit,
  };
}

function detailFromListRow(row: IhMonitoringRow): IhMonitoringDetail {
  const limits = agentLimits(row.agent);
  const unit = limits?.unit ?? row.resultUnit;
  const oshaPel = limits?.oshaPel ?? row.oel.replace(` ${unit}`, "");
  const acgihTlv = limits?.acgihTlv ?? oshaPel;
  const nioshRel = limits?.nioshRel ?? oshaPel;
  const internalLimit = limits?.internalLimit ?? oshaPel;
  const oelLimit = oshaPel;
  const actionLevel = String(Number((parseNum(oelLimit) * 0.5).toFixed(3)));

  return {
    id: row.id,
    code: row.code,
    agent: row.agent,
    employee: row.employee,
    workArea: row.workArea,
    method: row.method,
    sampleDuration: row.sampleType,
    sampleDate: row.date,
    laboratory: "—",
    linkedPlan: "—",
    resultValue: row.resultValue,
    resultUnit: row.resultUnit,
    status: row.status,
    actionLevel,
    oelLimit,
    oelRows: oelRowsFor(
      row.resultValue,
      unit,
      oshaPel,
      acgihTlv,
      nioshRel,
      internalLimit,
    ),
    hasAttachments: false,
    capaMessage:
      row.status === "Exceeded"
        ? "CAPA recommended — result exceeds the applicable limit."
        : "No CAPA required — result is within acceptable limits.",
  };
}

/** Full detail overrides — Figma 5348:34282 (MR-001). */
const DETAIL_OVERRIDES: Record<string, Partial<IhMonitoringDetail>> = {
  "mr-1": {
    laboratory: "ALS Industrial",
    linkedPlan: "SP-001",
    actionLevel: "0.500",
    oelLimit: "1",
    oelRows: oelRowsFor("0.08", "ppm", "1", "0.5", "0.1", "0.1"),
    capaMessage: "No CAPA required — result is within acceptable limits.",
  },
  "mr-3": {
    laboratory: "ALS Industrial",
    linkedPlan: "SP-001",
    capaMessage: "CAPA recommended — result exceeds the applicable limit.",
  },
  "mr-5": {
    laboratory: "In-house",
    linkedPlan: "SP-001",
    capaMessage: "CAPA recommended — result exceeds the applicable limit.",
  },
};

export function getIhMonitoringDetail(
  recordId: string,
): IhMonitoringDetail | null {
  const row = IH_MONITORING_ROWS.find((item) => item.id === recordId);
  if (!row) return null;

  const base = detailFromListRow(row);
  const override = DETAIL_OVERRIDES[recordId];
  return override ? { ...base, ...override } : base;
}

/** Progress fill as % of OSHA OEL scale (0 → oelLimit). */
export function ihResultScalePercent(detail: IhMonitoringDetail): number {
  const result = parseNum(detail.resultValue);
  const oel = parseNum(detail.oelLimit);
  if (!Number.isFinite(result) || !Number.isFinite(oel) || oel <= 0) return 0;
  return Math.min(100, Math.max(0, (result / oel) * 100));
}

export function ihActionLevelScalePercent(detail: IhMonitoringDetail): number {
  const action = parseNum(detail.actionLevel);
  const oel = parseNum(detail.oelLimit);
  if (!Number.isFinite(action) || !Number.isFinite(oel) || oel <= 0) return 50;
  return Math.min(100, Math.max(0, (action / oel) * 100));
}
