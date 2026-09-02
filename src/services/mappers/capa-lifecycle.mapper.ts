import type { CapaLifecycleSlice } from "@/components/capa/capa-dashboard-data";
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
    completed: asCount(readProp(raw, "completed", "Completed")),
    pendingVerification: asCount(
      readProp(raw, "pendingVerification", "PendingVerification"),
    ),
    overdue: asCount(readProp(raw, "overdue", "Overdue")),
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
  completed: "#10b981",
  pendingVerification: "#f59e0b",
  // Red, and the same red the register's Overdue badge uses - the slice and the chip it
  // corresponds to should not need translating between them.
  overdue: "#ef4444",
} as const;

/** Maps GET /api/v1/capas/lifecycle into donut slices + total. */
export function mapCapaLifecycleToView(
  dto: CapaLifecycleDto | null | undefined,
): CapaLifecycleViewModel {
  // Nothing to draw rather than the Figma placeholder. The constants this returned carried an
  // Overdue wedge the mapping below deliberately omits, so a failed request drew a donut whose
  // shape no query could have produced.
  if (!dto) {
    return { slices: [], total: 0 };
  }

  // Five mutually exclusive buckets summing to `total`, which is what makes a donut readable.
  //
  // Overdue is one of them now. It could not be while the API counted it as a subset - a CAPA
  // was Open *and also* late, so a fifth slice double-counted rows already in one of the other
  // four. The endpoint now excludes late rows from Open and In Progress and reports Overdue on
  // the same predicate the register's filter uses, so the two agree and "Open" here means open
  // and on time.
  //
  // Completed and Pending Verification are never late by that predicate: the assignee has
  // finished, and a Pending Verification CAPA past its date is waiting on a verifier rather
  // than on the person who did the work.
  //
  // Closed is absent because the endpoint is about active work - `total` counts non-closed
  // CAPAs, so adding Closed here would make every percentage wrong. `Verified` was a slice
  // reading a field the API has never sent, and showed 0 forever.
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
      label: "Completed",
      value: dto.completed ?? 0,
      color: SLICE_COLORS.completed,
    },
    {
      label: "Pending Verification",
      value: dto.pendingVerification ?? 0,
      color: SLICE_COLORS.pendingVerification,
    },
    {
      label: "Overdue",
      value: dto.overdue ?? 0,
      color: SLICE_COLORS.overdue,
    },
  ];

  const sliceSum = slices.reduce((sum, slice) => sum + slice.value, 0);
  const total =
    dto.total != null && Number.isFinite(dto.total) && dto.total > 0
      ? dto.total
      : sliceSum;

  return { slices, total };
}
