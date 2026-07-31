import type {
  CapaItem,
  CapaSummaryCounts,
  HierarchyControlRow,
} from "@/components/incidents/detail/linked-capa/capa-types";
import type { CreateCapaRequestDto } from "@/dtos/req/capa-request.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";

export const CAPA_CONTROL_LEVELS = [
  "Elimination",
  "Substitution",
  "Engineering Controls",
  "Administrative Controls",
  "PPE",
] as const;

export type CapaControlLevel = (typeof CAPA_CONTROL_LEVELS)[number];

export type { CapaSummaryCounts };

export type LinkedCapaViewModel = Readonly<{
  items: readonly CapaItem[];
  summary: CapaSummaryCounts;
  hierarchy: readonly HierarchyControlRow[];
  noticeMessage: string | null;
}>;

const EMPTY_SUMMARY: CapaSummaryCounts = {
  totalCount: 0,
  inProgressCount: 0,
  verifiedCount: 0,
  planningCount: 0,
};

function normalizeControlLevel(value: string): string {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower === "administrative controls" ||
    lower === "administrative control"
  ) {
    return "Administrative Controls";
  }
  if (lower === "engineering controls" || lower === "engineering control") {
    return "Engineering Controls";
  }
  if (lower === "elimination") return "Elimination";
  if (lower === "substitution") return "Substitution";
  if (lower === "ppe") return "PPE";

  return trimmed;
}

function formatDueDate(value: string | null | undefined): string {
  if (!value || value.trim() === "") {
    return "—";
  }

  const raw = value.trim();
  // Prefer YYYY-MM-DD when the API sends ISO datetimes.
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${String(y)}-${m}-${d}`;
}

function normalizeActionType(value: string): CapaItem["actionType"] {
  return value.trim().toLowerCase() === "preventive"
    ? "Preventive"
    : "Corrective";
}

function normalizeStatus(dto: CapaDto): CapaItem["status"] {
  const raw = (dto.status ?? "").trim().toLowerCase();

  if (raw === "verified" || raw === "complete" || raw === "completed") {
    return "Verified";
  }
  if (raw === "closed" || raw === "dropped") {
    return "Closed";
  }
  if (
    raw === "in progress" ||
    raw === "in-progress" ||
    raw === "progress" ||
    raw === "active"
  ) {
    return "In progress";
  }
  if (raw === "planning" || raw === "planned" || raw === "new") {
    return "Planning";
  }

  // API has no status today — derive a light signal from priority.
  const priority = dto.priority.trim().toLowerCase();
  if (priority === "high") {
    return "In progress";
  }

  return "Planning";
}

function progressForStatus(
  status: CapaItem["status"],
  explicit: number | null | undefined,
): number {
  if (
    typeof explicit === "number" &&
    Number.isFinite(explicit) &&
    explicit >= 0
  ) {
    return Math.min(100, Math.max(0, Math.round(explicit)));
  }

  switch (status) {
    case "Verified":
    case "Closed":
      return 100;
    case "In progress":
      return 45;
    case "Planning":
    default:
      return 10;
  }
}

function resolveAssignee(
  dto: CapaDto,
  options?: Readonly<{ currentUserId?: number }>,
): string {
  const named = dto.assigneeName?.trim() || dto.ownerName?.trim() || "";
  if (named) {
    return named;
  }

  if (options?.currentUserId != null && dto.userId === options.currentUserId) {
    return getAuthDisplayName(`User ${String(dto.userId)}`);
  }

  return `User ${String(dto.userId)}`;
}

export function mapCapaDtoToItem(
  dto: CapaDto,
  options?: Readonly<{ currentUserId?: number }>,
): CapaItem {
  const status = normalizeStatus(dto);
  const progressPercent = progressForStatus(
    status,
    dto.progressPercent ?? dto.progress,
  );

  return {
    id: String(dto.id),
    code: dto.capaCode?.trim() || dto.code?.trim() || `CAPA-${String(dto.id)}`,
    controlCategory: normalizeControlLevel(dto.controlLevel),
    actionType: normalizeActionType(dto.capaType),
    status,
    statusTone: status === "Verified" ? "green" : "gray",
    title: dto.description.trim(),
    assignee: resolveAssignee(dto, options),
    dueDate: formatDueDate(dto.dueDate),
    progressPercent,
  };
}

export function buildCapaSummary(
  items: readonly CapaItem[],
): CapaSummaryCounts {
  let inProgressCount = 0;
  let verifiedCount = 0;
  let planningCount = 0;

  for (const item of items) {
    if (item.status === "In progress") inProgressCount += 1;
    else if (item.status === "Verified" || item.status === "Closed") {
      verifiedCount += 1;
    } else {
      planningCount += 1;
    }
  }

  return {
    totalCount: items.length,
    inProgressCount,
    verifiedCount,
    planningCount,
  };
}

export function buildControlCoverage(
  items: readonly CapaItem[],
): readonly HierarchyControlRow[] {
  const counts = new Map<string, number>(
    CAPA_CONTROL_LEVELS.map((level) => [level, 0]),
  );

  for (const item of items) {
    const level = normalizeControlLevel(item.controlCategory);
    if (counts.has(level)) {
      counts.set(level, (counts.get(level) ?? 0) + 1);
    }
  }

  return CAPA_CONTROL_LEVELS.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }));
}

export function buildCoverageNotice(
  hierarchy: readonly HierarchyControlRow[],
): string | null {
  const elimination = hierarchy.find((row) => row.label === "Elimination");
  if (!elimination || elimination.count > 0) {
    return null;
  }

  return "No elimination control yet. Consider removing or redesigning the hazard at source.";
}

export function mapCapaDtosToLinkedView(
  dtos: readonly CapaDto[],
  options?: Readonly<{ currentUserId?: number }>,
): LinkedCapaViewModel {
  const active = dtos.filter((dto) => !dto.isDrop);
  const items = active.map((dto) => mapCapaDtoToItem(dto, options));
  const summary = buildCapaSummary(items);
  const hierarchy = buildControlCoverage(items);
  const noticeMessage = buildCoverageNotice(hierarchy);

  return { items, summary, hierarchy, noticeMessage };
}

export const EMPTY_LINKED_CAPA_VIEW: LinkedCapaViewModel = {
  items: [],
  summary: EMPTY_SUMMARY,
  hierarchy: CAPA_CONTROL_LEVELS.map((label) => ({ label, count: 0 })),
  noticeMessage: buildCoverageNotice(
    CAPA_CONTROL_LEVELS.map((label) => ({ label, count: 0 })),
  ),
};

/** Normalize UI control level (Add CAPA modal) to API enum casing. */
export function toApiControlLevel(level: string): string {
  return normalizeControlLevel(level);
}

export function buildCreateCapaRequest(input: {
  incidentId: number;
  controlLevel: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  priority: string;
}): CreateCapaRequestDto {
  const auth = getAuthContext();
  const ownerTrimmed = input.owner.trim();
  const ownerAsId = Number(ownerTrimmed);
  const userId =
    Number.isFinite(ownerAsId) && ownerTrimmed !== "" && ownerAsId > 0
      ? Math.trunc(ownerAsId)
      : (auth?.userId ?? 0);

  return {
    id: 0,
    incidentId: input.incidentId,
    userId,
    capaType:
      input.type.trim().toLowerCase() === "preventive"
        ? "Preventive"
        : "Corrective",
    priority: normalizePriority(input.priority),
    controlLevel: toApiControlLevel(input.controlLevel),
    description: input.description.trim(),
    dueDate: input.dueDate.trim() ? input.dueDate.trim() : null,
    isDrop: false,
  };
}

function normalizePriority(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower === "high") return "High";
  if (lower === "low") return "Low";
  return "Medium";
}
