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

/**
 * Drop a numbering prefix from a section title, so the template's
 * "Section 1: Basic Information" reads as just "Basic Information".
 * A title without the separator is left alone.
 */
function stripSectionPrefix(title: string): string {
  return title.replace(/^\s*section\s*\d*\s*[:.\-–—]\s*/i, "").trim() || title;
}

/** Just enough of a template section to score it. */
export type ReportSection = Readonly<{
  title: string;
  items: readonly Readonly<{ id: string }>[];
}>;

/**
 * Build the report straight from GET /api/v1/audits/{id}, which carries everything
 * it needs: the audit's metadata, the template snapshot (sections, items and
 * pass threshold) and the recorded responses.
 */
export function buildAuditReportFromDetail(dto: AuditDetailDto): AuditReport {
  const snapshot = dto.snapshot;
  const passThreshold = snapshot?.passThreshold ?? 0;

  const answerByItemId = new Map(
    (dto.responses ?? []).map((answer) => [answer.templateItemId, answer]),
  );

  /** "Yes" over everything scorable; N/A items don't count either way. */
  const scoreOf = (itemIds: readonly number[]): number | null => {
    const scorable = itemIds
      .map((id) => answerByItemId.get(id))
      .filter((answer) => answer !== undefined)
      .filter((answer) => !answer.isNA);
    if (scorable.length === 0) return null;

    const passed = scorable.filter(
      (answer) => answer.valueText.trim().toLowerCase() === "yes",
    ).length;
    return Math.round((passed / scorable.length) * 100);
  };

  const sections = [...(snapshot?.sections ?? [])].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const sectionScores = sections.flatMap((section) => {
    const score = scoreOf((section.items ?? []).map((item) => item.id));
    return score === null
      ? []
      : [{ section: stripSectionPrefix(section.sectionTitle ?? ""), score }];
  });

  const allItemIds = sections.flatMap((section) =>
    (section.items ?? []).map((item) => item.id),
  );
  const overall = dto.score ?? scoreOf(allItemIds) ?? 0;

  const failed = (dto.responses ?? []).filter(
    (answer) => !answer.isNA && answer.valueText.trim().toLowerCase() === "no",
  ).length;

  const executiveSummary = [
    `${dto.auditTitle || "This audit"} covered ${String(allItemIds.length)} items across ${String(sections.length)} sections.`,
    `It scored ${String(overall)}%, ${overall >= passThreshold ? "meeting" : "below"} the ${String(passThreshold)}% pass threshold.`,
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
    auditId: `A-${String(dto.id)}`,
    title: dto.auditTitle || "Audit report",
    scope: [snapshot?.templateName, formatLocation(dto.location ?? "")]
      .filter(Boolean)
      .join(" · "),
    score: overall,
    auditor: dto.auditorName || "Unassigned",
    date:
      (dto.scheduleDate || dto.startedAt || dto.submittedAt || "").slice(
        0,
        10,
      ) || "—",
    status: dto.status || "—",
    passThreshold,
    executiveSummary,
    sectionScores,
  };
}

/** Map an API audit detail onto the detail panel's donut shape. */
