/** Response from POST /api/v1/ai/assist (inside `dataModel`). */

/**
 * Every AI answer, keyed by field name.
 *
 * A map rather than named properties because which fields exist is a property
 * of the record kind's prompt, not of the wire type:
 *
 * - a rewrite answers with `text`;
 * - an incident draft with `description`, `injuryDescription` and `actionNotes`;
 * - a near-miss or hazard draft with `narrative`.
 *
 * `null` on any field is a real answer, not a failure, and each has its own
 * meaning:
 *
 * - `description` — the reporter already wrote one, so the backend refuses to
 *   replace it. Null on every call that sent a non-blank `text`.
 * - `injuryDescription` — nothing given identifies an injury to a person, or
 *   the injury level says nobody was hurt.
 * - `actionNotes` — no immediate-response actions were described.
 * - `narrative` — the answers given do not support a draft: a near miss needs a
 *   contributing factor, a hazard needs a potential consequence.
 *
 * Forcing a draft where the answer is null is exactly what would push the model
 * into inventing one, so absence must render as nothing at all — not an empty
 * slot, and not an error.
 */
export type AiAssistResultDto = {
  results: Record<string, string | null>;
};
