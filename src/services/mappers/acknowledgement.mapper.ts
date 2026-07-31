import type {
  DocumentAcknowledgementRowDto,
  DocumentAcknowledgementsDto,
} from "@/dtos/res/document-response.dto";
import type { AcknowledgmentRecord } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export type FindMyAcknowledgementResult =
  | { ackId: number; error?: undefined }
  | { ackId: null; error: string };

/**
 * GET /api/Document/versions/{id}/acknowledgements has no way to filter by
 * user — each row only has a display `name`. Match it against the logged-in
 * user's name, and fail closed (never guess) if the match isn't exactly one row.
 */
export function findMyAcknowledgement(
  rows: readonly DocumentAcknowledgementRowDto[],
  myName: string | null,
): FindMyAcknowledgementResult {
  if (!myName?.trim()) {
    return {
      ackId: null,
      error: "Could not verify your account name to record this acknowledgement.",
    };
  }

  const target = normalizeName(myName);
  const matches = rows.filter(
    (row) => row.name != null && normalizeName(row.name) === target,
  );

  if (matches.length === 0) {
    return {
      ackId: null,
      error: "Could not find your acknowledgement record for this document.",
    };
  }

  if (matches.length > 1) {
    return {
      ackId: null,
      error:
        "Multiple acknowledgement records match your name — contact support.",
    };
  }

  const id = matches[0]?.id;
  if (id == null) {
    return {
      ackId: null,
      error: "Your acknowledgement record is missing an id.",
    };
  }

  return { ackId: id };
}

function normalizeStatus(value: string | null | undefined): "Acknowledged" | "Pending" {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "acknowledged" || normalized === "approved" || normalized === "complete") {
    return "Acknowledged";
  }
  return "Pending";
}

function formatDate(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }
  return parsed.toISOString().slice(0, 10);
}

export function mapAcknowledgementRowDto(
  row: DocumentAcknowledgementRowDto,
): AcknowledgmentRecord {
  const id = row.id ?? 0;
  return {
    id: String(id),
    name: row.name?.trim() || "—",
    department: row.department?.trim() || "—",
    status: normalizeStatus(row.status),
    acknowledgedDate: formatDate(row.acknowledgedDate),
  };
}

export function mapAcknowledgementsDto(
  dto: DocumentAcknowledgementsDto | null | undefined,
): {
  records: AcknowledgmentRecord[];
  acknowledgedCount: number;
  pendingCount: number;
  completionRate: number;
} {
  const rows = dto?.rows ?? [];
  const records = rows.map(mapAcknowledgementRowDto);
  const acknowledgedCount = dto?.acknowledgedCount ?? 0;
  const pendingCount = dto?.pendingCount ?? 0;
  const completionRate = dto?.completionRate ?? 0;

  return {
    records,
    acknowledgedCount,
    pendingCount,
    completionRate,
  };
}
