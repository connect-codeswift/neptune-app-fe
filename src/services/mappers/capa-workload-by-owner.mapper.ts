import type { CapaOwnerWorkload } from "@/components/capa/capa-dashboard-data";
import type {
  CapaWorkloadByOwnerDto,
  CapaWorkloadOwnerDto,
} from "@/dtos/res/capa-workload-by-owner-response.dto";

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

function asOptionalId(value: unknown): number | null {
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

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function normalizeOwner(raw: unknown): CapaWorkloadOwnerDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const ownerName = asString(
    readProp(
      raw,
      "ownerName",
      "OwnerName",
      "assigneeName",
      "AssigneeName",
      "assignedName",
      "AssignedName",
      "name",
      "Name",
      "fullName",
      "FullName",
      "userName",
      "UserName",
    ),
  );

  if (!ownerName) {
    return null;
  }

  return {
    assignedId: asOptionalId(
      readProp(
        raw,
        "assignedId",
        "AssignedId",
        "ownerId",
        "OwnerId",
        "userId",
        "UserId",
        "id",
        "Id",
      ),
    ),
    ownerName,
    // totalCapas first, deliberately. The endpoint already excludes Closed, so its
    // totalCapas *is* the owner's open workload, while its openCapas counts only the Open
    // stage - dropping every In Progress, Completed and Pending Verification row. Reading
    // the latter made this card total 58 under a KPI tile reading 71 on the same screen,
    // for the one word both of them call "Open".
    openCount: asCount(
      readProp(
        raw,
        "totalCapas",
        "TotalCapas",
        "openCount",
        "OpenCount",
        "openCapas",
        "OpenCapas",
        "open",
        "Open",
        "count",
        "Count",
        "total",
        "Total",
      ),
    ),
  };
}

function extractOwnerList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isRecord(raw)) {
    return [];
  }

  const nested = readProp(
    raw,
    "owners",
    "Owners",
    "items",
    "Items",
    "data",
    "Data",
    "workload",
    "Workload",
  );

  return Array.isArray(nested) ? nested : [];
}

/** Normalize GET /api/v1/capas/workload-by-owner `dataModel`. */
export function normalizeCapaWorkloadByOwnerDto(
  raw: unknown,
): CapaWorkloadByOwnerDto | null {
  const owners = extractOwnerList(raw)
    .map((entry) => normalizeOwner(entry))
    .filter((entry): entry is CapaWorkloadOwnerDto => entry != null);

  if (owners.length === 0 && !Array.isArray(raw) && !isRecord(raw)) {
    return null;
  }

  return { owners };
}

export type CapaWorkloadByOwnerViewModel = Readonly<{
  owners: readonly CapaOwnerWorkload[];
}>;

/** Maps GET /api/v1/capas/workload-by-owner into bar-list rows. */
export function mapCapaWorkloadByOwnerToView(
  dto: CapaWorkloadByOwnerDto | null | undefined,
): CapaWorkloadByOwnerViewModel {
  // Empty either way. This used to answer a failed or refused request with the Figma
  // owners, which reads exactly like real data and is the same trap the KPI tiles, the
  // lifecycle donut and the trend line were in.
  if (dto == null || !dto.owners || dto.owners.length === 0) {
    return { owners: [] };
  }

  const owners: CapaOwnerWorkload[] = [...dto.owners]
    .map((owner) => ({
      name: owner.ownerName ?? "Unassigned",
      openCount: owner.openCount ?? 0,
    }))
    .sort((a, b) => b.openCount - a.openCount);

  return { owners };
}
