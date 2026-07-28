import type {
  AuditDetail,
  AuditRecord,
  AuditStatus,
} from "@/app/dashboard/audits/audits-data";
import type { AuditFinding } from "@/app/dashboard/audits/findings/audit-findings-data";
import type { AuditReport } from "@/app/dashboard/audits/report/audit-report-data";
import type { AuditItemResponseRequestDto } from "@/dtos/req/audit-request.dto";
import type {
  AuditDetailDto,
  AuditDto,
  AuditFindingDto,
  AuditResponsesResultDto,
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

/** Just enough of a template section to score it. */
export type ReportSection = Readonly<{
  title: string;
  items: readonly Readonly<{ id: string }>[];
}>;

/**
 * Build the report from the three sources behind it: the audit (who/when), the
 * template's sections (per-section scores) and the submission result (status).
 *
 * Section scores are computed from the submitted answers because the result
 * only reports a `runningScore` for the audit as a whole.
 */
export function buildAuditReport(
  input: Readonly<{
    audit: AuditDto | null;
    result: AuditResponsesResultDto;
    answers: readonly AuditItemResponseRequestDto[];
    sections: readonly ReportSection[];
  }>,
): AuditReport {
  const { audit, result, answers, sections } = input;

  const answerByItemId = new Map(
    answers.map((answer) => [answer.templateItemId, answer]),
  );

  /** "Yes" over everything scorable; N/A items don't count either way. */
  const scoreOf = (itemIds: readonly string[]): number | null => {
    const scorable = itemIds
      .map((id) => answerByItemId.get(Number(id)))
      .filter((answer) => answer !== undefined)
      .filter((answer) => !answer.isNA);
    if (scorable.length === 0) return null;

    const passed = scorable.filter(
      (answer) => answer.valueText.toLowerCase() === "yes",
    ).length;
    return Math.round((passed / scorable.length) * 100);
  };

  const sectionScores = sections.flatMap((section) => {
    const score = scoreOf(section.items.map((item) => item.id));
    return score === null ? [] : [{ section: section.title, score }];
  });

  const overall =
    result.runningScore ??
    scoreOf(sections.flatMap((section) => section.items.map((i) => i.id))) ??
    0;

  const itemCount = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );
  const failed = answers.filter(
    (answer) => !answer.isNA && answer.valueText.toLowerCase() === "no",
  ).length;

  const summary = [
    `${audit?.auditTitle || "This audit"} covered ${String(itemCount)} items across ${String(sections.length)} sections.`,
    `It scored ${String(overall)}%, ${overall >= 80 ? "meeting" : "below"} the 80% pass threshold.`,
    failed > 0
      ? `${String(failed)} item${failed === 1 ? "" : "s"} did not pass and may need corrective action.`
      : "No items failed.",
    result.hasCriticalFailure
      ? "A critical item failed — this requires immediate attention."
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    auditId: `A-${String(result.id)}`,
    title: audit?.auditTitle || "Audit report",
    scope: [audit?.templateName, formatLocation(audit?.location ?? "")]
      .filter(Boolean)
      .join(" · "),
    score: overall,
    auditor: audit?.auditorName || "Unassigned",
    date: (audit?.submittedAt || audit?.scheduleDate || "").slice(0, 10) || "—",
    status: result.status || audit?.status || "—",
    executiveSummary: summary,
    sectionScores,
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
