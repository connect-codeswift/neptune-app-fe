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
