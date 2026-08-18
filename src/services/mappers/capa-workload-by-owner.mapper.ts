import {
  CAPA_OWNER_WORKLOAD,
  type CapaOwnerWorkload,
} from "@/components/capa/capa-dashboard-data";
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
    openCount: asCount(
      readProp(
        raw,
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

/** Normalize GET /api/CAPA/workload-by-owner `dataModel`. */
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

/** Maps GET /api/CAPA/workload-by-owner into bar-list rows. */
export function mapCapaWorkloadByOwnerToView(
  dto: CapaWorkloadByOwnerDto | null | undefined,
): CapaWorkloadByOwnerViewModel {
  if (dto == null) {
    return { owners: CAPA_OWNER_WORKLOAD };
  }

  if (!dto.owners || dto.owners.length === 0) {
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
