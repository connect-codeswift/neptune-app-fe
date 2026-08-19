/** Responses from the incident AI-assist endpoints (inside `dataModel`). */

/**
 * POST /api/v1/incidents/ai/proofread and POST /api/v1/incidents/ai/paraphrase.
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
 * POST /api/v1/incidents/ai/draft-assist — all three drafts from one call.
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

/**
 * POST /api/v1/near-misses/ai/draft-assist and POST /api/v1/hazards/ai/draft-assist.
 *
 * One field, not three: these forms have a single narrative box rather than the
 * incident wizard's description / injury / actions split.
 *
 * `null` is a real answer and will be common — it means the answers given do
 * not support a draft (§3 of the guide: near miss needs a contributing factor,
 * hazard needs a potential consequence). Render nothing at all for it: no ghost
 * text, no empty accept button, no "the assistant had nothing to say".
 */
export type NarrativeDraftResultDto = {
  narrative: string | null;
};
