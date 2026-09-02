import { isApiError } from "@/lib/axios";

/** User-facing message for detail-summary panel failures. */
export function detailSummaryErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403) {
      return "You are not assigned to this run and cannot view its breakdown.";
    }
    if (error.status === 404) {
      return "This run could not be found.";
    }
    if (error.status === 400) {
      return "Breakdown is available once the checklist has been started.";
    }
  }

  return "Could not load the breakdown for this run.";
}

/**
 * The question ids a rejected submit is blocking on.
 *
 * `POST /audits/{id}/submit` answers 400 with the ids rather than prose, so the
 * page can scroll to the offending rows instead of showing a toast the auditor
 * then has to hunt against. Two different payloads use these keys:
 * `{ missingItemIds }` for unanswered required questions, and
 * `{ missingNoteItemIds, missingPhotoItemIds }` for missing evidence.
 */
export type SubmitBlockers = Readonly<{
  unanswered: number[];
  missingNotes: number[];
  missingPhotos: number[];
}>;

function readIdList(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is number => typeof entry === "number",
      );
    }
  }
  return [];
}

/**
 * Both casings are read because the backend serializes a thrown exception's
 * payload as PascalCase while a controller's own envelope is camelCase.
 */
export function readSubmitBlockers(error: unknown): SubmitBlockers {
  const empty: SubmitBlockers = {
    unanswered: [],
    missingNotes: [],
    missingPhotos: [],
  };

  if (!isApiError(error) || typeof error.data !== "object" || !error.data) {
    return empty;
  }

  const envelope = error.data as Record<string, unknown>;
  const details = envelope.errorDetails ?? envelope.ErrorDetails;
  if (typeof details !== "object" || !details) {
    return empty;
  }

  const source = details as Record<string, unknown>;
  return {
    unanswered: readIdList(source, "missingItemIds", "MissingItemIds"),
    missingNotes: readIdList(
      source,
      "missingNoteItemIds",
      "MissingNoteItemIds",
    ),
    missingPhotos: readIdList(
      source,
      "missingPhotoItemIds",
      "MissingPhotoItemIds",
    ),
  };
}
