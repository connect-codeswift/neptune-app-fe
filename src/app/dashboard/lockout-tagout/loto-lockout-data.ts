import { LOTO_ROUTE } from "./loto-procedure-data";

export type LotoEnergySourceView = Readonly<{
  id: string;
  label: string;
  pointLabel: string;
  kind: "electrical" | "hydraulic" | "pneumatic" | "other";
}>;

/** Everything the apply-lockout screen needs, built from the equipment detail DTO. */
export type LotoApplyLockoutContext = Readonly<{
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string;
  energySources: readonly LotoEnergySourceView[];
  operatorName: string;
  canApply: boolean;
  cannotApplyReason: string | null;
}>;

/** Everything the remove-lockout screen needs, built from the lockout row + equipment detail. */
export type LotoRemoveLockoutContext = Readonly<{
  lockoutId: number;
  equipmentId: number;
  equipmentName: string;
  equipmentCode: string;
  operatorName: string;
  lockNumber: string;
  startedAt: string;
  purpose: string;
  energySources: readonly LotoEnergySourceView[];
  signOffName: string;
}>;

export const LOTO_REMOVE_SAFETY_RULES = [
  "ONLY the person who applied the lock may remove it",
  "Never remove another person's lock — contact supervisor",
  "Ensure all personnel are physically clear before restoring energy",
  "Do not bypass any step in this checklist",
  "If any doubt exists, do NOT restore energy — call EHS",
] as const;

export function lotoApplyLockoutRoute(equipmentId: number): string {
  return `${LOTO_ROUTE}/equipment/${String(equipmentId)}/apply`;
}

export function lotoRemoveLockoutRoute(lockoutId: number): string {
  return `${LOTO_ROUTE}/lockout/${String(lockoutId)}/remove`;
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

export function toEnergySourceViews(
  sources: readonly string[],
): readonly LotoEnergySourceView[] {
  return sources.map((label, index) => ({
    id: `es-${String(index + 1)}`,
    label,
    pointLabel: `Point ${String(index + 1)}`,
    kind: energyKind(label),
  }));
}
