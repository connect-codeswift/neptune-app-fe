import type {
  AuditDetail,
  AuditRecord,
  AuditStatus,
} from "@/app/dashboard/audits/audits-data";
import type {
  AuditDetailDto,
  AuditDto,
} from "@/dtos/res/audit-response.dto";

/** Prettify a location code (e.g. "plant-b" -> "Plant B"); pass through others. */
function formatLocation(location: string): string {
  const known: Record<string, string> = {
    all: "All",
    "plant-a": "Plant A",
    "plant-b": "Plant B",
    "warehouse-1": "Warehouse 1",
  };
  return known[location] ?? location;
}

/** Coerce the API status onto the register's filterable status union. */
function toAuditStatus(status: string): AuditStatus {
  const normalized = status.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "inprogress" || normalized === "ongoing")
    return "In progress";
  if (
    normalized === "closed" ||
    normalized === "completed" ||
    normalized === "done"
  )
    return "Closed";
  // Fall back to the raw label so unexpected statuses still render.
  return status as AuditStatus;
}

/** Map an API audit row onto the register table's record shape. */
export function mapAuditDtoToRecord(dto: AuditDto): AuditRecord {
  return {
    id: String(dto.id),
    title: dto.auditTitle || "Untitled audit",
    scope: dto.templateName || dto.kind || "Audit",
    site: formatLocation(dto.location ?? ""),
    auditor: dto.auditorName || "Unassigned",
    progress: dto.progressPct ?? 0,
    status: toAuditStatus(dto.status ?? ""),
    dueDate: (dto.scheduleDate ?? "").slice(0, 10),
    findings: dto.findingCount > 0 ? `${String(dto.findingCount)} open` : null,
  };
}

/** Map an API audit detail onto the detail panel's donut shape. */
export function mapAuditDetailDtoToDetail(dto: AuditDetailDto): AuditDetail {
  const sections = dto.snapshot?.sections ?? [];
  const items = sections.flatMap((section) => section.items ?? []);
  const total = items.length;

  // No per-response scoring is available yet, so the breakdown is derived from
  // the snapshot: critical items form the critical slice, the rest are pending.
  const critical = items.filter((item) => item.isCritical).length;
  const pending = Math.max(0, total - critical);

  // Progress is the share of answered items; a scheduled audit has no responses.
  const answered = dto.responses?.length ?? 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return {
    id: String(dto.id),
    title: dto.auditTitle || "Untitled audit",
    progress,
    items: { pass: 0, action: 0, critical, pending },
    topFindings: [],
  };
}
