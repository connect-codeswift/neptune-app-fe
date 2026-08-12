import {
  LOTO_ACTIVE_LOCKOUTS,
  LOTO_EQUIPMENT,
  type LotoActiveLockout,
  type LotoEquipmentItem,
} from "./loto-data";
import { LOTO_ROUTE } from "./loto-procedure-data";

export type LotoEnergySourceView = Readonly<{
  id: string;
  label: string;
  pointLabel: string;
  kind: "electrical" | "hydraulic" | "pneumatic" | "other";
}>;

export type LotoApplyLockoutContext = Readonly<{
  equipment: LotoEquipmentItem;
  equipmentCode: string;
  procedureId: string;
  energySources: readonly LotoEnergySourceView[];
  operatorName: string;
}>;

export type LotoRemoveLockoutContext = Readonly<{
  lockout: LotoActiveLockout;
  equipment: LotoEquipmentItem;
  equipmentCode: string;
  energySources: readonly LotoEnergySourceView[];
  signOffName: string;
}>;

const LOTO_CURRENT_OPERATOR = "Sarah Mitchell";

export const LOTO_REMOVE_SAFETY_RULES = [
  "ONLY the person who applied the lock may remove it",
  "Never remove another person's lock — contact supervisor",
  "Ensure all personnel are physically clear before restoring energy",
  "Do not bypass any step in this checklist",
  "If any doubt exists, do NOT restore energy — call EHS",
] as const;

export function lotoApplyLockoutRoute(equipmentId: string): string {
  return `${LOTO_ROUTE}/equipment/${equipmentId}/apply`;
}

export function lotoRemoveLockoutRoute(lockoutId: string): string {
  return `${LOTO_ROUTE}/lockout/${lockoutId}/remove`;
}

function equipmentCodeFor(item: LotoEquipmentItem): string {
  const match = item.id.match(/\d+/);
  const num = match ? match[0].padStart(3, "0") : "000";
  return `EQ-${num}`;
}

function energyKind(label: string): LotoEnergySourceView["kind"] {
  const lower = label.toLowerCase();
  if (lower.includes("electric")) return "electrical";
  if (lower.includes("hydraulic")) return "hydraulic";
  if (lower.includes("pneumatic") || lower.includes("pressure")) {
    return "pneumatic";
  }
  return "other";
}

function toEnergySourceViews(
  sources: readonly string[],
): readonly LotoEnergySourceView[] {
  return sources.map((label, index) => ({
    id: `es-${index + 1}`,
    label,
    pointLabel: `Point ${index + 1}`,
    kind: energyKind(label),
  }));
}

export function getLotoApplyLockoutContext(
  equipmentId: string,
): LotoApplyLockoutContext | undefined {
  const equipment = LOTO_EQUIPMENT.find((item) => item.id === equipmentId);
  if (!equipment) return undefined;

  return {
    equipment,
    equipmentCode: equipmentCodeFor(equipment),
    procedureId: equipment.procedureId,
    energySources: toEnergySourceViews(equipment.energySources),
    operatorName: LOTO_CURRENT_OPERATOR,
  };
}

function getActiveLockoutById(
  lockoutId: string,
): LotoActiveLockout | undefined {
  return LOTO_ACTIVE_LOCKOUTS.find((item) => item.id === lockoutId);
}

export function getActiveLockoutForEquipment(
  equipmentId: string,
): LotoActiveLockout | undefined {
  return LOTO_ACTIVE_LOCKOUTS.find((item) => item.equipmentId === equipmentId);
}

export function getLotoRemoveLockoutContext(
  lockoutId: string,
): LotoRemoveLockoutContext | undefined {
  const lockout = getActiveLockoutById(lockoutId);
  if (!lockout) return undefined;

  const equipment = LOTO_EQUIPMENT.find(
    (item) => item.id === lockout.equipmentId,
  );
  if (!equipment) return undefined;

  return {
    lockout,
    equipment,
    equipmentCode: equipmentCodeFor(equipment),
    energySources: toEnergySourceViews(equipment.energySources),
    signOffName: LOTO_CURRENT_OPERATOR,
  };
}
