/**
 * Request body for the AI writing assistant.
 *
 * Suggest-only: nothing here persists anything, and each module's own create
 * endpoint is still the only call that saves a record. The API key never
 * touches the browser — we post the reporter's text to our own API and the
 * backend talks to the model.
 *
 * Caller identity (userId, siteId) and the model id are deliberately absent.
 * The backend reads identity from the JWT and owns the model choice; sending
 * either from here would be ignored at best and spoofable at worst.
 */

/** Backend caps text at this; we slice rather than let it 400. */
export const AI_TEXT_MAX_CHARS = 8000;

/**
 * What the reporter has filled in, keyed by the label the form shows —
 * `"Mechanism of injury"`, not `"mechanismOfInjury"`.
 *
 * The keys reach the model as prose, so they have to read as the form's own
 * wording. Send **labels, not ids**: `"Severity": "Serious"`, never
 * `"serious"`, and the classification answers as the displayed `"Yes"` / `"No"`
 * rather than booleans.
 */
export type AiAssistFields = Record<string, string>;

/**
 * Body for POST /api/v1/ai/assist — every AI call in the app.
 *
 * One endpoint replaced eleven (a proofread/paraphrase/draft-assist trio under
 * incidents, hazards and near-misses, plus a rewrite pair under LOTO). They
 * already shared one prompt file and one service on the backend; what they did
 * not share was eleven controller actions with identical bodies.
 */
export type AiAssistRequestDto = {
  /**
   * Which kind of record this is, as the backend names it — see `RECORD_KINDS`
   * in `ai-text.service.ts`. It selects the prompt, the permission and the role
   * set together, so it is not cosmetic.
   */
  recordKind: string;

  operation: "proofread" | "paraphrase" | "draft";

  /**
   * The text to rewrite. On a draft this is instead the reporter's own account
   * where the form has one, so the model can be told not to replace it: `""`
   * says they have not written one yet, and omitting it says this record kind
   * has no such field.
   */
  text?: string;

  /**
   * Draft only. Which single field to draft, when the caller wants one rather
   * than every field this record kind produces.
   *
   * The incident prompt produces three. With a Draft button per textarea, a
   * call that answered all three would pay for three drafts and use one — so
   * the field being filled is named, and the schema narrows to it. Omit to get
   * every key.
   */
  targetField?: string;

  /** Draft only. Blank values are dropped before sending. */
  fields?: AiAssistFields;
};
