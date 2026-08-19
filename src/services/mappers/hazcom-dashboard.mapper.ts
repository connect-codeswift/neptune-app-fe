import type {
  HazcomTrainingCompliance,
  HazcomUpcomingDeadline,
} from "@/components/hazcom/shared";
import {
  asNumber,
  asString,
  isRecord,
  readProp,
  toIsoDate,
} from "@/services/mappers/record-readers";

function toDaysLeft(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function toDaysLeftLabel(daysLeft: number | null): string {
  if (daysLeft === null) {
    return "No due date";
  }
  if (daysLeft < 0) {
    return "Overdue";
  }
  if (daysLeft === 0) {
    return "Due today";
  }
  if (daysLeft === 1) {
    return "1 day left";
  }
  return `${String(daysLeft)} days left`;
}

function mapUpcomingDeadlineDto(
  raw: unknown,
): HazcomUpcomingDeadline | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asString(readProp(raw, "id", "Id"));
  const title = asString(readProp(raw, "title", "Title"));
  if (id === "" || title === "") {
    return null;
  }

  const daysLeft = toDaysLeft(readProp(raw, "daysLeft", "DaysLeft"));

  return {
    id,
    title,
    type: asString(readProp(raw, "type", "Type")),
    owner: asString(readProp(raw, "owner", "Owner")),
    dueDate: toIsoDate(readProp(raw, "dueDate", "DueDate")),
    daysLeft,
    daysLeftLabel: toDaysLeftLabel(daysLeft),
  };
}

/** Maps GET /api/hazcom/dashboard/upcoming-deadlines onto overview rows. */
export function mapUpcomingDeadlineDtos(
  rows: readonly unknown[],
): HazcomUpcomingDeadline[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapUpcomingDeadlineDto(row))
    .filter((row): row is HazcomUpcomingDeadline => row !== null);
}

function countFromLabel(
  label: string,
  value: number,
  counts: HazcomTrainingCompliance,
): HazcomTrainingCompliance {
  const lower = label.trim().toLowerCase();
  if (lower.includes("never")) {
    return { ...counts, neverTrained: value };
  }
  if (lower.includes("due soon") || lower.includes("duesoon")) {
    return { ...counts, dueSoon: value };
  }
  if (lower.includes("overdue")) {
    return { ...counts, overdue: value };
  }
  if (lower.includes("compliant")) {
    return { ...counts, compliant: value };
  }
  return counts;
}

function emptyTrainingCompliance(): HazcomTrainingCompliance {
  return { compliant: 0, dueSoon: 0, overdue: 0, neverTrained: 0 };
}

function mapTrainingComplianceFromRows(
  rows: readonly unknown[],
): HazcomTrainingCompliance {
  let counts = emptyTrainingCompliance();

  for (const row of rows) {
    if (!isRecord(row)) continue;
    const label = asString(
      readProp(row, "status", "Status", "label", "Label", "type", "Type"),
    );
    const value = asNumber(
      readProp(row, "count", "Count", "value", "Value", "total", "Total"),
    );
    counts = countFromLabel(label, value, counts);
  }

  return counts;
}

function hasComplianceCount(
  record: Record<string, unknown>,
  ...keys: string[]
): boolean {
  return readProp(record, ...keys) !== undefined;
}

/** Maps GET /api/hazcom/dashboard/training-compliance onto overview counts. */
export function mapTrainingComplianceDto(
  raw: unknown,
): HazcomTrainingCompliance | null {
  if (raw == null) {
    return null;
  }

  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return null;
    }
    return mapTrainingComplianceFromRows(raw);
  }

  if (!isRecord(raw)) {
    return null;
  }

  const hasCounts =
    hasComplianceCount(raw, "compliant", "Compliant", "compliantCount") ||
    hasComplianceCount(
      raw,
      "dueSoon",
      "DueSoon",
      "dueSoonCount",
      "due_soon",
    ) ||
    hasComplianceCount(raw, "overdue", "Overdue", "overdueCount") ||
    hasComplianceCount(
      raw,
      "neverTrained",
      "NeverTrained",
      "neverTrainedCount",
      "never_trained",
    );

  if (!hasCounts) {
    return null;
  }

  return {
    compliant: asNumber(
      readProp(raw, "compliant", "Compliant", "compliantCount"),
    ),
    dueSoon: asNumber(
      readProp(raw, "dueSoon", "DueSoon", "dueSoonCount", "due_soon"),
    ),
    overdue: asNumber(readProp(raw, "overdue", "Overdue", "overdueCount")),
    neverTrained: asNumber(
      readProp(
        raw,
        "neverTrained",
        "NeverTrained",
        "neverTrainedCount",
        "never_trained",
      ),
    ),
  };
}
