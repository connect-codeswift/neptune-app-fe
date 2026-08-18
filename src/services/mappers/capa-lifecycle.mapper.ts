import type { CapaLifecycleSlice } from "@/components/capa/capa-dashboard-data";
import { CAPA_LIFECYCLE_SLICES } from "@/components/capa/capa-dashboard-data";
import type { CapaLifecycleDto } from "@/dtos/res/capa-lifecycle-response.dto";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.trunc(parsed));
    }
  }
  return 0;
}

/** Normalize GET /api/v1/capas/lifecycle `dataModel`. */
export function normalizeCapaLifecycleDto(
  raw: unknown,
): CapaLifecycleDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    open: asCount(readProp(raw, "open", "Open")),
    inProgress: asCount(readProp(raw, "inProgress", "InProgress")),
    overdue: asCount(readProp(raw, "overdue", "Overdue")),
    verified: asCount(readProp(raw, "verified", "Verified")),
    total: asCount(readProp(raw, "total", "Total")),
  };
}

export type CapaLifecycleViewModel = Readonly<{
  slices: readonly CapaLifecycleSlice[];
  total: number;
}>;

const SLICE_COLORS = {
  open: "#0891a6",
  inProgress: "#3b82f6",
  overdue: "#ef4444",
  verified: "#10b981",
} as const;

/** Maps GET /api/v1/capas/lifecycle into donut slices + total. */
export function mapCapaLifecycleToView(
  dto: CapaLifecycleDto | null | undefined,
): CapaLifecycleViewModel {
  if (!dto) {
    const total = CAPA_LIFECYCLE_SLICES.reduce(
      (sum, slice) => sum + slice.value,
      0,
    );
    return { slices: CAPA_LIFECYCLE_SLICES, total };
  }

  const slices: readonly CapaLifecycleSlice[] = [
    {
      label: "Open",
      value: dto.open ?? 0,
      color: SLICE_COLORS.open,
    },
    {
      label: "In progress",
      value: dto.inProgress ?? 0,
      color: SLICE_COLORS.inProgress,
    },
    {
      label: "Overdue",
      value: dto.overdue ?? 0,
      color: SLICE_COLORS.overdue,
    },
    {
      label: "Verified",
      value: dto.verified ?? 0,
      color: SLICE_COLORS.verified,
    },
  ];

  const sliceSum = slices.reduce((sum, slice) => sum + slice.value, 0);
  const total =
    dto.total != null && Number.isFinite(dto.total) && dto.total > 0
      ? dto.total
      : sliceSum;

  return { slices, total };
}
