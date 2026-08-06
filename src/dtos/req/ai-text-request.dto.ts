/**
 * Request bodies for the two incident AI-assist endpoints.
 *
 * Both are suggest-only: neither persists anything, and POST /Incident/incident
 * is still the only call that saves a record. The API key never touches the
 * browser — we post the reporter's text to our own API and the backend talks to
 * the model.
 *
 * Caller identity (userId, siteId) and the model id are deliberately absent.
 * The backend reads identity from the JWT and owns the model choice; sending
 * either from here would be ignored at best and spoofable at worst.
 */

/** Body for POST /api/Incident/proofread. */
export type ProofreadRequestDto = {
  /** Backend rejects blank, and caps at 8000 characters. */
  text: string;
};

/** Body for POST /api/Incident/draft-assist. */
export type IncidentDraftRequestDto = {
  /** The step 2 description. Required; backend caps at 8000 characters. */
  description: string;
  /** Optional step 1 context — these only sharpen the follow-up suggestions. */
  severity?: string;
  location?: string;
  /** ISO-8601 UTC. */
  incidentAt?: string;
  /**
   * The reporter's step 3 selections, as labels rather than ids.
   *
   * Unlike the fields above these are not garnish. The model is forbidden from
   * inventing a body part, so a description that never names one yields no
   * injury draft at all — and plenty of real descriptions ("he fell off the
   * ladder and was taken to hospital") never name one. These are what make the
   * injury draft possible, which is why it is requested again once the reporter
   * has chosen them.
   */
  injuredBodyPart?: string;
  injuryLevel?: string;
};

/** Longest text either endpoint accepts, mirroring the backend's [MaxLength]. */
export const AI_TEXT_MAX_CHARS = 8000;
