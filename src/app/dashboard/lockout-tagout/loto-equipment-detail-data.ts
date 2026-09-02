import type { LotoApplyBlockKindDto } from "@/dtos/res/loto-response.dto";
import type { LotoEquipmentStatus, LotoHistoryRecord } from "./loto-data";

export type LotoEquipmentDetailTab = "overview" | "procedure" | "history";

export type LotoEquipmentPersonnel = Readonly<{
  id: number;
  name: string;
  initials: string;
}>;

export type LotoRecentLockout = Readonly<{
  id: number;
  purpose: string;
  operator: string;
  date: string;
  duration: string;
}>;

export type LotoProcedureStepView = Readonly<{
  id: string;
  /** Energy type chip shown above the step description. */
  tag: string;
  description: string;
  isolationPoint: string;
  lockTagPosition: string;
}>;

export type LotoEquipmentDetail = Readonly<{
  id: number;
  equipmentCode: string;
  name: string;
  location: string;
  locationId: number;
  status: LotoEquipmentStatus;
  hazardLevel: string;
  description: string;
  /** How to confirm zero energy. Empty when the author left it blank. */
  verificationMethod: string;
  additionalNotes: string;
  isOutOfService: boolean;
  lastInspection: string;
  energySources: readonly string[];
  authorizedPersonnel: readonly LotoEquipmentPersonnel[];
  procedureSteps: readonly LotoProcedureStepView[];
  recentLockouts: readonly LotoRecentLockout[];
  history: readonly LotoHistoryRecord[];
  canApply: boolean;
  cannotApplyReason: string | null;
  cannotApplyKind: LotoApplyBlockKindDto | null;
}>;

export const LOTO_EQUIPMENT_DETAIL_TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "procedure" as const, label: "Procedure" },
  { id: "history" as const, label: "History" },
] as const;

export function lotoEquipmentDetailRoute(
  equipmentId: number,
  tab?: LotoEquipmentDetailTab,
): string {
  const base = `/dashboard/lockout-tagout/equipment/${String(equipmentId)}`;
  if (!tab || tab === "overview") return base;
  return `${base}?tab=${tab}`;
}
