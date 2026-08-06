/** Responses from the incident AI-assist endpoints (inside `dataModel`). */

/**
 * POST /api/Incident/proofread and POST /api/Incident/paraphrase.
 *
 * Identical shape on purpose — only the path and the behaviour differ. When
 * there is nothing to correct, the text comes back unchanged rather than as an
 * error, which is what the "Nothing to correct" toast is for.
 */
export type RewriteResultDto = {
  rewrittenText: string;
};

/** @deprecated Use `RewriteResultDto` — paraphrase shares the same shape. */
export type ProofreadResultDto = RewriteResultDto;

/**
 * POST /api/Incident/draft-assist — all three drafts from one call.
 *
 * `null` on any field is a real answer, not a failure, and each has its own
 * meaning:
 *
 * - `description` — the reporter already wrote one, so the backend refuses to
 *   replace it. Null on every call that sent a non-blank `description`. Never
 *   render a ghost draft over text that is already there.
 * - `injuryDescription` — nothing given identifies an injury to a person, or
 *   the injury level says nobody was hurt.
 * - `actionNotes` — no immediate-response actions were described.
 *
 * Forcing a draft where the answer is null is exactly what would push the model
 * into inventing one, so absence must render as nothing at all — not an empty
 * slot, and not an error.
 */
export type IncidentDraftResultDto = {
  description: string | null;
  injuryDescription: string | null;
  actionNotes: string | null;
};
