import type {
  AuditDetail,
  AuditRecord,
  AuditStatus,
} from "@/app/dashboard/audits/audits-data";
import type { AuditFinding } from "@/app/dashboard/audits/findings/audit-findings-data";
import type {
  AuditDetailDto,
  AuditDto,
  AuditFindingDto,
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

/** The backend owns the status vocabulary, so its label is used as-is. */
function toAuditStatus(status: string): AuditStatus {
  return status.trim();
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

/** Map an API finding onto the findings page's card shape. */
export function mapFindingDtoToFinding(dto: AuditFindingDto): AuditFinding {
  return {
    id: String(dto.id),
    severity: dto.severity ?? dto.findingSeverity ?? "—",
    category: dto.category ?? dto.findingCategory ?? "General",
    description: dto.description ?? dto.title ?? dto.question ?? "",
    status: dto.status ?? "Open",
    capaCreated: dto.capaCreated ?? dto.isCapaCreated ?? false,
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
