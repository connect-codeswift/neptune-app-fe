/** Responses from the two incident AI-assist endpoints (inside `dataModel`). */

/** POST /api/Incident/proofread */
export type ProofreadResultDto = {
  rewrittenText: string;
};

/**
 * POST /api/Incident/draft-assist — all three drafts from one call.
 *
 * `null` on either text field is a real answer, not a failure: it means the
 * reporter described no injury / no response actions. Forcing a draft there is
 * exactly what would push the model into inventing one, so absence is
 * meaningful and must render as nothing at all.
 */
export type IncidentDraftResultDto = {
  injuryDescription: string | null;
  actionNotes: string | null;
  /** Can legitimately be empty when the description is too sparse. */
  suggestedFollowUps: string[];
};
