import type { CapaAwaitingReviewRow } from "@/components/capa/capa-dashboard-data";
import type {
  CapaAwaitingReviewDto,
  CapaAwaitingReviewItemDto,
} from "@/dtos/res/capa-awaiting-review-response.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";
import { CAPA_API_STATUS, formatCapaStatusDisplay } from "@/lib/capa-filters";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import { formatCapaDaysLeftLabel } from "@/services/mappers/capa.mapper";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return null;
}

function asCount(value: unknown): number | null {
  const parsed = asId(value);
  return parsed == null ? null : Math.max(0, parsed);
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function normalizeItem(raw: unknown): CapaAwaitingReviewItemDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asId(readProp(raw, "id", "Id", "capaId", "CapaId"));
  if (id == null || id <= 0) {
    return null;
  }

  return {
    id,
    title: asString(
      readProp(raw, "title", "Title", "description", "Description"),
    ),
    capaType: asString(readProp(raw, "capaType", "CapaType", "type", "Type")),
    priority: asString(readProp(raw, "priority", "Priority")),
    assignedId: asId(
      readProp(raw, "assignedId", "AssignedId", "ownerId", "OwnerId"),
    ),
    assignedName: asString(
      readProp(
        raw,
        "assignedName",
        "AssignedName",
        "assigneeName",
        "AssigneeName",
        "ownerName",
        "OwnerName",
      ),
    ),
    dueDate: asString(readProp(raw, "dueDate", "DueDate")),
    createdAt: asString(readProp(raw, "createdAt", "CreatedAt")),
  };
}

function extractItemList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isRecord(raw)) {
    return [];
  }

  const nested = readProp(raw, "items", "Items", "data", "Data");
  return Array.isArray(nested) ? nested : [];
}

/** Normalize GET /api/v1/capas/awaiting-effectiveness-review `dataModel`. */
export function normalizeCapaAwaitingReviewDto(
  raw: unknown,
): CapaAwaitingReviewDto | null {
  if (!Array.isArray(raw) && !isRecord(raw)) {
    return null;
  }

  const items = extractItemList(raw)
    .map((entry) => normalizeItem(entry))
    .filter((entry): entry is CapaAwaitingReviewItemDto => entry != null);

  const totalPending = isRecord(raw)
    ? asCount(readProp(raw, "totalPending", "TotalPending", "total", "Total"))
    : null;

  return { totalPending: totalPending ?? items.length, items };
}

function toRow(
  options: Readonly<{
    id: number;
    title: string | null | undefined;
    assignedId: number | null;
    assignedName: string | null | undefined;
    dueDate: string | null | undefined;
    daysLeft?: number | null;
    status: string;
  }>,
): CapaAwaitingReviewRow {
  return {
    capaId: options.id,
    code: formatRecordDisplayId("CAPA", options.id),
    title: options.title?.trim() || `CAPA-${String(options.id)}`,
    owner: options.assignedName?.trim() || "Unassigned",
    assignedId: options.assignedId,
    status: options.status,
    dueLabel: formatCapaDaysLeftLabel(options.daysLeft ?? null, {
      dueDate: options.dueDate,
      status: options.status,
    }),
  };
}

/**
 * Rows from GET /api/v1/capas/awaiting-effectiveness-review — always
 * `Pending Verification`; the endpoint filters on that status server-side.
 */
export function mapCapaAwaitingReviewToRows(
  dto: CapaAwaitingReviewDto | null | undefined,
): readonly CapaAwaitingReviewRow[] {
  if (!dto?.items.length) {
    return [];
  }

  return dto.items.map((item) =>
    toRow({
      id: item.id,
      title: item.title,
      assignedId: item.assignedId ?? null,
      assignedName: item.assignedName,
      dueDate: item.dueDate,
      status: CAPA_API_STATUS.pendingVerification,
    }),
  );
}

/**
 * Rows from GET /api/v1/capas?Status=Completed — tasks are done but nobody has
 * asked for a review yet. The backend lets leadership verify straight from this
 * status, so the queue shows both.
 */
export function mapCompletedCapaDtosToReviewRows(
  dtos: readonly CapaDto[] | null | undefined,
): readonly CapaAwaitingReviewRow[] {
  if (!dtos?.length) {
    return [];
  }

  return dtos
    .filter((dto) => !dto.isDrop)
    .map((dto) =>
      toRow({
        id: dto.id,
        title: dto.title ?? dto.description,
        assignedId: dto.assignedId ?? null,
        assignedName: dto.assignedName ?? dto.assigneeName ?? dto.ownerName,
        dueDate: dto.dueDate,
        daysLeft: dto.daysLeft,
        status: formatCapaStatusDisplay(
          dto.status ?? CAPA_API_STATUS.completed,
        ),
      }),
    );
}
