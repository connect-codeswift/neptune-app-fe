import type { DocumentAcknowledgementRowDto } from "@/dtos/res/document-response.dto";

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
      error:
        "Could not verify your account name to record this acknowledgement.",
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
