import type { MetricCardProps } from "@/components/ui/MetricCard";

export type LotoTabId =
  "equipment" | "active-lockouts" | "history" | "personnel";

export type LotoEquipmentStatus = "Operational" | "Locked Out" | "Maintenance";

export type LotoStatusFilter = "all" | LotoEquipmentStatus;

export type LotoMetric = MetricCardProps;

/** One row of the equipment register — mapped from the GetAllEquipment grid DTO. */
export type LotoEquipmentItem = Readonly<{
  id: number;
  /** Display code with prefix, e.g. "EQ-7". */
  equipmentCode: string;
  name: string;
  location: string;
  energySources: readonly string[];
  status: LotoEquipmentStatus;
  lastInspection: string;
}>;

export const LOTO_TABS = [
  { id: "equipment" as const, label: "Equipment" },
  { id: "active-lockouts" as const, label: "Active Lockouts" },
  { id: "history" as const, label: "History" },
  { id: "personnel" as const, label: "Personnel" },
] as const;

export const LOTO_STATUS_FILTERS = [
  { id: "all" as const, label: "All" },
  { id: "Operational" as const, label: "Operational" },
  { id: "Locked Out" as const, label: "Locked Out" },
  { id: "Maintenance" as const, label: "Maintenance" },
] as const;

export type LotoActiveLockout = Readonly<{
  id: number;
  logCode: string;
  equipmentId: number;
  equipmentName: string;
  purpose: string;
  operator: string;
  /** Display lock number with prefix, e.g. "LK-12". */
  lockNumber: string;
  startedAt: string;
  expectedEndAt: string;
  canRemove: boolean;
}>;

export type LotoHistoryResult = "Completed" | "Active";

export type LotoHistoryRecord = Readonly<{
  id: number;
  logId: string;
  equipment: string;
  operator: string;
  lockNumber: string;
  startAt: string;
  endAt: string;
  purpose: string;
  duration: string;
  result: LotoHistoryResult;
}>;

export type LotoPersonnelStatus = "Current" | "Expired";

export type LotoPersonnel = Readonly<{
  /** Backend user id. */
  id: number;
  name: string;
  initials: string;
  certifiedOn: string;
  expiresOn: string;
  /** Display equipment codes with prefix, e.g. "EQ-7". */
  equipmentIds: readonly string[];
  status: LotoPersonnelStatus;
}>;
