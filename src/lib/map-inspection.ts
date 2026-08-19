import type { InspectionRecord } from "@/app/dashboard/inspections/inspections-data";
import type { InspectionFinding } from "@/app/dashboard/inspections/findings/inspection-findings-data";
import type { InspectionChecklist } from "@/app/dashboard/inspections/checklist/inspection-checklist-data";
import type { InspectionReport } from "@/app/dashboard/inspections/report/inspection-report-data";
import type {
  InspectionDetailDto,
  InspectionDto,
  InspectionFindingDto,
} from "@/dtos/res/inspection-response.dto";
import { formatRunStatus } from "@/lib/audit-inspection-status";
import { formatRecordDisplayId } from "@/lib/format-record-id";

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
function formatInspectionDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthName = SHORT_MONTHS[Number(month) - 1];
  if (!monthName) return value;

  return `${String(Number(day))} ${monthName}, ${year.slice(2)}`;
}

/** Prettify a location code (e.g. "plant-a" -> "Plant A"); pass through others. */
function formatLocation(location: string): string {
  const known: Record<string, string> = {
    all: "All",
    "plant-a": "Plant A",
    "plant-b": "Plant B",
    "warehouse-1": "Warehouse 1",
  };
  return known[location] ?? location;
}

/**
 * Drop a numbering prefix from a section title, so the template's
 * "Section 1: Basic Information" reads as just "Basic Information".
 */
function stripSectionPrefix(title: string): string {
  return title.replace(/^\s*section\s*\d*\s*[:.\-–—]\s*/i, "").trim() || title;
}

/** Map an API inspection row onto the register table's record shape. */
export function mapInspectionDtoToRecord(dto: InspectionDto): InspectionRecord {
  return {
    id: String(dto.id),
    title: dto.inspectionTitle || "Untitled inspection",
    scope: dto.templateName || dto.kind || "Inspection",
    site: formatLocation(dto.location ?? ""),
    inspector: dto.inspectorName || "Unassigned",
    progress: dto.progressPct ?? 0,
    status: formatRunStatus((dto.status ?? "").trim()),
    dueDate: formatInspectionDate(dto.scheduleDate ?? ""),
    findings:
      (dto.findingCount ?? 0) > 0 ? `${String(dto.findingCount)} open` : null,
  };
}

/** Map an API finding onto the findings page card shape. */
export function mapFindingDtoToFinding(
  dto: InspectionFindingDto,
): InspectionFinding {
  return {
    id: String(dto.id),
    severity: dto.severity ?? dto.findingSeverity ?? "—",
    category: dto.category ?? dto.findingCategory ?? "General",
    description: dto.description ?? dto.title ?? dto.question ?? "",
    status: dto.status ?? "Open",
    capaCreated: dto.capaCreated ?? dto.isCapaCreated ?? false,
  };
}

/** Map an API inspection detail onto the detail panel's donut shape. */
/**
 * Turn GET /api/v1/inspections/{id} into a runnable checklist: the template
 * snapshot carries the sections and their items.
 */
export function mapInspectionDetailToChecklist(
  dto: InspectionDetailDto,
): InspectionChecklist {
  const sections = [...(dto.snapshot?.sections ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => ({
      id: String(section.id),
      title: section.sectionTitle || "Untitled section",
      items: [...(section.items ?? [])]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((item) => ({
          id: String(item.id),
          question: item.question ?? "",
        })),
    }));

  return {
    inspectionId: formatRecordDisplayId("I", dto.id),
    subtitle: dto.inspectionTitle || dto.snapshot?.templateName || "Inspection",
    sections,
  };
}

/**
 * Build the report straight from GET /api/v1/inspections/{id}, which carries
 * everything it needs: the inspection's metadata, the template snapshot
 * (sections, items and pass threshold) and the recorded responses.
 */
export function buildInspectionReportFromDetail(
  dto: InspectionDetailDto,
): InspectionReport {
  const snapshot = dto.snapshot;
  const passThreshold = snapshot?.passThreshold ?? 0;

  // The write side sends `inspectionItemId`; accept either name on read.
  const answerByItemId = new Map(
    (dto.responses ?? []).map((answer) => [
      answer.inspectionItemId ?? answer.templateItemId,
      answer,
    ]),
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

  // Every section is listed — an unanswered one reads 0% rather than vanishing.
  const sectionScores = sections.map((section) => ({
    section: stripSectionPrefix(section.sectionTitle ?? ""),
    score: scoreOf((section.items ?? []).map((item) => item.id)) ?? 0,
  }));

  const allItemIds = sections.flatMap((section) =>
    (section.items ?? []).map((item) => item.id),
  );
  const overall = dto.score ?? scoreOf(allItemIds) ?? 0;

  const failed = (dto.responses ?? []).filter(
    (answer) => !answer.isNA && answer.valueText.trim().toLowerCase() === "no",
  ).length;

  const executiveSummary = [
    `${dto.inspectionTitle || "This inspection"} covered ${String(allItemIds.length)} items across ${String(sections.length)} sections.`,
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
    inspectionId: formatRecordDisplayId("I", dto.id),
    title: dto.inspectionTitle || "Inspection report",
    scope: [snapshot?.templateName, formatLocation(dto.location ?? "")]
      .filter(Boolean)
      .join(" · "),
    score: overall,
    inspector: dto.inspectorName || "Unassigned",
    date:
      (dto.submittedAt || dto.startedAt || dto.scheduleDate || "").slice(
        0,
        10,
      ) || "—",
    status: dto.status || "—",
    passThreshold,
    executiveSummary,
    sectionScores,
  };
}
