import {
  LOTO_EQUIPMENT,
  LOTO_HISTORY,
  type LotoEquipmentItem,
  type LotoEquipmentStatus,
  type LotoHistoryRecord,
} from "./loto-data";

export type LotoEquipmentDetailTab = "overview" | "procedure" | "history";

export type LotoEquipmentPersonnel = Readonly<{
  id: string;
  name: string;
  initials: string;
}>;

export type LotoRecentLockout = Readonly<{
  id: string;
  purpose: string;
  operator: string;
  date: string;
  duration: string;
}>;

export type LotoProcedureStepView = Readonly<{
  id: string;
  tag: string;
  description: string;
  critical?: boolean;
}>;

export type LotoEquipmentDetail = Readonly<{
  id: string;
  equipmentCode: string;
  name: string;
  type: string;
  location: string;
  status: LotoEquipmentStatus;
  procedureId: string;
  lastInspection: string;
  energySources: readonly string[];
  authorizedPersonnel: readonly LotoEquipmentPersonnel[];
  recentLockouts: readonly LotoRecentLockout[];
  procedureSteps: readonly LotoProcedureStepView[];
  procedureLastUpdated: string;
  history: readonly LotoHistoryRecord[];
}>;

export const LOTO_EQUIPMENT_DETAIL_TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "procedure" as const, label: "Procedure" },
  { id: "history" as const, label: "History" },
] as const;

export function lotoEquipmentDetailRoute(
  equipmentId: string,
  tab?: LotoEquipmentDetailTab,
): string {
  const base = `/dashboard/lockout-tagout/equipment/${equipmentId}`;
  if (!tab || tab === "overview") return base;
  return `${base}?tab=${tab}`;
}

const PRESS_PROCEDURE_STEPS: readonly LotoProcedureStepView[] = [
  {
    id: "ps-1",
    tag: "Notify",
    description:
      "Notify all affected employees that the equipment will be de-energized and serviced. Post warning tags on all operating controls.",
  },
  {
    id: "ps-2",
    tag: "Identify",
    description:
      "Identify all energy sources (electrical, hydraulic, pneumatic). Locate all energy isolation points per this procedure sheet.",
  },
  {
    id: "ps-3",
    tag: "Shutdown",
    description:
      "Initiate the normal stopping sequence using the machine's standard stop button or switch. Allow all motion to cease completely.",
  },
  {
    id: "ps-4",
    tag: "Isolate",
    description:
      "Operate all energy isolation devices (main disconnect, shutoff valves, breakers) to their SAFE/OFF position.",
  },
  {
    id: "ps-5",
    tag: "Apply",
    description:
      "Apply your personal lockout device and LOTO tag with name, date, and contact info to each isolation point. Each worker applies their own lock.",
    critical: true,
  },
  {
    id: "ps-6",
    tag: "Release",
    description:
      "Release or restrain all residual stored energy: bleed hydraulic/pneumatic lines, lower suspended parts, discharge capacitors. Verify zero energy via gauges.",
    critical: true,
  },
  {
    id: "ps-7",
    tag: "Verify",
    description:
      "ATTEMPT TO START using normal start controls. If equipment moves or energizes, STOP — re-isolate and investigate before proceeding.",
    critical: true,
  },
  {
    id: "ps-8",
    tag: "Record",
    description:
      "Record this lockout in the LOTO log before beginning work. Include lock number, purpose, time, and your initials.",
  },
];

const DEFAULT_PERSONNEL: readonly LotoEquipmentPersonnel[] = [
  { id: "rk", name: "Robert Kim", initials: "RK" },
  { id: "tb", name: "Tom Bradley", initials: "TB" },
  { id: "cr", name: "Carlos Ruiz", initials: "CR" },
];

function equipmentCodeFor(item: LotoEquipmentItem): string {
  const match = item.id.match(/\d+/);
  const num = match ? match[0].padStart(3, "0") : "000";
  return `EQ-${num}`;
}

function historyForEquipment(item: LotoEquipmentItem): LotoHistoryRecord[] {
  const nameKey = item.name.split(" - ")[0]?.trim().toLowerCase() ?? "";

  return LOTO_HISTORY.filter((record) =>
    record.equipment.toLowerCase().includes(nameKey.slice(0, 12)),
  );
}

function recentFromHistory(
  history: readonly LotoHistoryRecord[],
): LotoRecentLockout[] {
  return history.slice(0, 3).map((record) => ({
    id: record.id,
    purpose: record.purpose,
    operator: record.operator,
    date: record.startAt.slice(0, 10),
    duration: record.duration === "—" ? "In progress" : record.duration,
  }));
}

function toDetail(item: LotoEquipmentItem): LotoEquipmentDetail {
  const history = historyForEquipment(item);
  const recentLockouts =
    recentFromHistory(history).length > 0
      ? recentFromHistory(history)
      : [
          {
            id: `${item.id}-recent-1`,
            purpose: "Scheduled maintenance",
            operator: "Robert Kim",
            date: item.lastInspection,
            duration: "2h 00m",
          },
        ];

  return {
    id: item.id,
    equipmentCode: equipmentCodeFor(item),
    name: item.name,
    type: item.type,
    location: item.location,
    status: item.status,
    procedureId: item.procedureId,
    lastInspection: item.lastInspection,
    energySources: item.energySources,
    authorizedPersonnel: DEFAULT_PERSONNEL,
    recentLockouts,
    procedureSteps: PRESS_PROCEDURE_STEPS,
    procedureLastUpdated: item.lastInspection,
    history:
      history.length > 0
        ? history
        : LOTO_HISTORY.filter((record) => record.result === "Completed").slice(
            0,
            4,
          ),
  };
}

const DETAIL_BY_ID: ReadonlyMap<string, LotoEquipmentDetail> = new Map(
  LOTO_EQUIPMENT.map((item) => [item.id, toDetail(item)]),
);

export function getLotoEquipmentDetail(
  equipmentId: string,
): LotoEquipmentDetail | undefined {
  return DETAIL_BY_ID.get(equipmentId);
}

export const statusClassName: Record<LotoEquipmentStatus, string> = {
  Operational: "bg-[rgba(15,23,42,0.06)] text-[#566072]",
  "Locked Out": "bg-[rgba(239,68,68,0.12)] text-[#ef4444]",
  Maintenance: "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
};
