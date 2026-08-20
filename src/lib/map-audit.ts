import type {
  AuditRecord,
  AuditStatus,
} from "@/app/dashboard/audits/audits-data";
import type { AuditFinding } from "@/app/dashboard/audits/findings/audit-findings-data";
import type { AuditReport } from "@/app/dashboard/audits/report/audit-report-data";
import type {
  AuditDetailDto,
  AuditDto,
  AuditFindingDto,
} from "@/dtos/res/audit-response.dto";
import { formatRunStatus } from "@/lib/audit-inspection-status";
import { formatRecordDisplayId } from "@/lib/format-record-id";

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

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * "2026-07-28T00:00:00" -> "28 Jul, 26".
 *
 * The date parts are read straight off the string rather than via `Date`, so
 * the day can't shift a timezone either way. Unrecognised input passes through.
 */
function formatAuditDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthName = SHORT_MONTHS[Number(month) - 1];
  if (!monthName) return value;

  return `${String(Number(day))} ${monthName}, ${year.slice(2)}`;
}

/** The backend owns the status vocabulary; map to a display label for the UI. */
function toAuditStatus(status: string): AuditStatus {
  return formatRunStatus(status);
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
    dueDate: formatAuditDate(dto.scheduleDate ?? ""),
    findings: dto.findingCount > 0 ? `${String(dto.findingCount)} open` : null,
  };
}

/**
 * Map an API finding onto the findings page's card shape.
 *
 * Every field below exists on the projection, so nothing is guessed. Two things
 * this deliberately does not do any more:
 *
 * - `title` is no longer collapsed into `description`. It is the finding, it is
 *   required server-side, and folding it into a fallback chain meant a finding
 *   with both fields showed only its detail and one with only a title showed
 *   that title as if it were the detail.
 * - there is no `capaCreated`. Nothing in the backend links a finding to a CAPA,
 *   so the flag could only ever be false and the badge it drove never rendered.
 */
export function mapFindingDtoToFinding(dto: AuditFindingDto): AuditFinding {
  return {
    id: String(dto.id),
    title: dto.title,
    severity: dto.severity,
    category: dto.category ?? "",
    description: dto.description ?? "",
    status: dto.status,
    isAutoRaised: dto.isAutoRaised,
    dueDate: dto.dueDate ? formatAuditDate(dto.dueDate) : "",
  };
}

/** Just enough of a template section to report on it. */
export type ReportSection = Readonly<{
  title: string;
  items: readonly Readonly<{ id: string }>[];
}>;

/**
 * Build the report straight from GET /api/v1/audits/{id}, which carries everything
 * it needs: the audit's metadata, the template snapshot (sections and items)
 * and the recorded responses.
 */
export function buildAuditReportFromDetail(dto: AuditDetailDto): AuditReport {
  const snapshot = dto.snapshot;

  const sections = [...(snapshot?.sections ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const allItemIds = sections.flatMap((section) =>
    (section.items ?? []).map((item) => item.id),
  );

  const failed = (dto.responses ?? []).filter(
    (answer) => !answer.isNA && answer.valueText.trim().toLowerCase() === "no",
  ).length;

  const executiveSummary = [
    `${dto.auditTitle || "This audit"} covered ${String(allItemIds.length)} items across ${String(sections.length)} sections.`,
    failed > 0
      ? `${String(failed)} item${failed === 1 ? "" : "s"} did not pass and may need corrective action.`
      : "No items failed.",
    dto.hasCriticalFailure
      ? "A critical item failed — this requires immediate attention."
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    auditId: formatRecordDisplayId("A", dto.id),
    title: dto.auditTitle || "Audit report",
    scope: [snapshot?.templateName, formatLocation(dto.location ?? "")]
      .filter(Boolean)
      .join(" · "),
    auditor: dto.auditorName || "Unassigned",
    date:
      (dto.scheduleDate || dto.startedAt || dto.submittedAt || "").slice(
        0,
        10,
      ) || "—",
    status: dto.status || "—",
    executiveSummary,
  };
}

/** Map an API audit detail onto the detail panel's donut shape. */
