import type {
  FormSchema,
  FormValues,
  SelectOption,
} from "@/components/form-builder";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  IH_CREATE_PLAN_AREA_OPTIONS,
  IH_CREATE_PLAN_METHODS,
} from "@/components/industrial-hygiene/ih-create-sampling-plan-data";
import { IH_PLAN_LIST } from "@/components/industrial-hygiene/ih-sampling-plans-data";
import { IH_AGENT_ROWS } from "@/components/industrial-hygiene/ih-agent-library-data";

export const IH_LOG_RESULT_PATH = `${IH_BASE_PATH}/monitoring-records/new`;
export const IH_LOG_RESULT_FORM_ID = "ih-log-monitoring-result";

export type IhAgentOelRef = Readonly<{
  id: string;
  value: string;
  label: string;
  unit: string;
  oshaPel: string;
  acgihTlv: string;
  nioshRel: string;
  internalLimit: string;
}>;

export const IH_LOG_RESULT_AGENTS: readonly IhAgentOelRef[] = IH_AGENT_ROWS.map(
  (row) => ({
    id: row.id,
    value: row.id,
    label: row.name,
    unit: row.unit,
    oshaPel: row.oshaPel,
    acgihTlv: row.acgihTlv,
    nioshRel: row.nioshRel,
    internalLimit: row.internalLimit,
  }),
);

export const IH_LOG_RESULT_AGENT_OPTIONS: readonly SelectOption[] =
  IH_LOG_RESULT_AGENTS.map((agent) => ({
    value: agent.value,
    label: agent.label,
  }));

export const IH_LOG_RESULT_DURATION_OPTIONS: readonly SelectOption[] = [
  { value: "full-shift-twa", label: "Full-shift TWA" },
  { value: "stel", label: "STEL" },
  { value: "ceiling", label: "Ceiling" },
  { value: "task-based", label: "Task-based" },
];

export const IH_LOG_RESULT_PLAN_OPTIONS: readonly SelectOption[] =
  IH_PLAN_LIST.map((plan) => ({
    value: plan.id,
    label: `${plan.code} — ${plan.title}`,
  }));

export function getIhLogResultAgent(
  agentId: string | undefined,
): IhAgentOelRef | null {
  if (!agentId) return null;
  return IH_LOG_RESULT_AGENTS.find((agent) => agent.value === agentId) ?? null;
}

export function formatIhOelValue(value: string, unit: string): string {
  return `${value} ${unit}`;
}

export function ihAgentHelperText(agent: IhAgentOelRef | null): string {
  if (!agent) return "Select an agent to load OEL reference values";
  return `OSHA PEL: ${formatIhOelValue(agent.oshaPel, agent.unit)}  TLV: ${formatIhOelValue(agent.acgihTlv, agent.unit)}  Internal: ${formatIhOelValue(agent.internalLimit, agent.unit)}`;
}

export type IhOelComparison = Readonly<{
  resultLabel: string;
  percentOfInternal: number;
  status: "Below Limit" | "Exceeded";
  limitLabel: string;
}>;

export function computeIhOelComparison(
  resultRaw: string,
  agent: IhAgentOelRef | null,
): IhOelComparison | null {
  if (!agent) return null;
  const result = Number.parseFloat(resultRaw);
  const limit = Number.parseFloat(agent.internalLimit);
  if (!Number.isFinite(result) || !Number.isFinite(limit) || limit <= 0) {
    return null;
  }

  const percent = Math.round((result / limit) * 100);
  return {
    resultLabel: formatIhOelValue(String(result), agent.unit),
    percentOfInternal: percent,
    status: result > limit ? "Exceeded" : "Below Limit",
    limitLabel: formatIhOelValue(agent.internalLimit, agent.unit),
  };
}

/** Log Monitoring Result form — Figma 5313:32963. */
export function createLogResultSchema(agentId: string): FormSchema {
  const agent = getIhLogResultAgent(agentId);

  return [
    {
      type: "select",
      name: "agent",
      label: "Hazard Agent",
      required: true,
      colSpan: 12,
      placeholder: "Select hazard agent…",
      options: IH_LOG_RESULT_AGENT_OPTIONS,
      helperText: ihAgentHelperText(agent),
    },
    {
      type: "text",
      name: "employee",
      label: "Employee / Group Sampled",
      colSpan: 6,
      placeholder: "Employee name or 'Group Sample'",
    },
    {
      type: "select",
      name: "workArea",
      label: "Work Area",
      required: true,
      colSpan: 6,
      placeholder: "Select work area…",
      options: IH_CREATE_PLAN_AREA_OPTIONS,
    },
    {
      type: "select",
      name: "method",
      label: "Sampling Method",
      required: true,
      colSpan: 6,
      placeholder: "Select method…",
      options: IH_CREATE_PLAN_METHODS,
    },
    {
      type: "select",
      name: "duration",
      label: "Sample Duration / Type",
      colSpan: 6,
      placeholder: "Select duration…",
      options: IH_LOG_RESULT_DURATION_OPTIONS,
    },
    {
      type: "text",
      name: "result",
      label: "Result",
      required: true,
      colSpan: 6,
      inputType: "number",
      placeholder: "0.00",
      helperText: agent ? `Unit: ${agent.unit}` : "Unit loads with agent",
    },
    {
      type: "date",
      name: "sampleDate",
      label: "Sample Date",
      required: true,
      colSpan: 6,
      // Logging a result means the sample has already been taken.
      limit: "not-future",
    },
    {
      type: "text",
      name: "laboratory",
      label: "Laboratory / Instrument",
      colSpan: 6,
      placeholder: "e.g. ALS Industrial, In-house",
    },
    {
      type: "select",
      name: "samplingPlan",
      label: "Linked Sampling Plan",
      colSpan: 6,
      placeholder: "Select sampling plan…",
      options: IH_LOG_RESULT_PLAN_OPTIONS,
    },
    {
      type: "textarea",
      name: "notes",
      label: "Notes / Chain of Custody Reference",
      colSpan: 12,
      rows: 3,
      placeholder: "Sample ID, lab COC number, sampling conditions…",
    },
    {
      type: "photo",
      name: "attachments",
      label: "Attach Lab Report / Instrument Printout",
      colSpan: 12,
      accept: "files",
      listVariant: "rows",
      placeholder: "Drop files here or click to browse — PDF, PNG, JPG",
      maxFiles: 5,
    },
  ];
}

export const IH_LOG_RESULT_INITIAL_VALUES: FormValues = {
  agent: "ag-1",
  employee: "",
  workArea: "",
  method: "",
  duration: "",
  result: "",
  sampleDate: "",
  laboratory: "",
  samplingPlan: "",
  notes: "",
  attachments: [],
};
