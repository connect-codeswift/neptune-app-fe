import type {
  DocumentAcknowledgementRowDto,
  DocumentAcknowledgementsDto,
} from "@/dtos/res/document-response.dto";
import type { AcknowledgmentRecord } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-types";

export type FindMyAcknowledgementResult =
  | { ackId: number; error?: undefined }
  | { ackId: null; error: string };

/**
 * Match the current user's acknowledgement row by userId.
 * The backend now returns `userId` on each row, so we never match by name.
 * Fails closed if the current user's row is missing or has no id.
 */
export function findMyAcknowledgement(
  rows: readonly DocumentAcknowledgementRowDto[],
  myUserId: number | null,
): FindMyAcknowledgementResult {
  if (myUserId == null) {
    return {
      ackId: null,
      error:
        "Could not verify your account name to record this acknowledgement.",
    };
  }

  const match = rows.find(
    (row) => row.userId != null && row.userId === myUserId,
  );

  if (!match) {
    return {
      ackId: null,
      error: "Could not find your acknowledgement record for this document.",
    };
  }

  const id = match.id;
  if (id == null) {
    return {
      ackId: null,
      error: "Your acknowledgement record is missing an id.",
    };
  }

  return { ackId: id };
}

function normalizeStatus(
  value: string | null | undefined,
): "Acknowledged" | "Pending" {
  const normalized = (value ?? "").trim().toLowerCase();
  if (
    normalized === "acknowledged" ||
    normalized === "approved" ||
    normalized === "complete"
  ) {
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
