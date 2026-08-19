/**
 * Request bodies for the incident AI-assist endpoints.
 *
 * All three are suggest-only: none persists anything, and POST /api/v1/incidents
 * is still the only call that saves a record. The API key never touches the
 * browser — we post the reporter's text to our own API and the backend talks to
 * the model.
 *
 * Caller identity (userId, siteId) and the model id are deliberately absent.
 * The backend reads identity from the JWT and owns the model choice; sending
 * either from here would be ignored at best and spoofable at worst.
 */

/**
 * Body for POST /api/v1/incidents/ai/proofread and POST /api/v1/incidents/ai/paraphrase.
 *
 * One type for both because the contract is identical by design — what differs
 * is behaviour, not shape. Proofread corrects spelling, grammar and punctuation
 * without restructuring; paraphrase merges run-ons, orders events
 * chronologically, lifts casual phrasing into report register and strips blame
 * language, keeping every fact and every hedge.
 */
export type RewriteRequestDto = {
  /** Backend rejects blank, and caps at 8000 characters. */
  text: string;
};

/** @deprecated Use `RewriteRequestDto` — paraphrase shares the same shape. */
export type ProofreadRequestDto = RewriteRequestDto;

/**
 * Body for POST /api/v1/incidents/ai/draft-assist.
 *
 * Every field is optional, but an entirely empty request is a 400. A request
 * carrying only dropdown values and no description is explicitly supported —
 * that is what drafts the description itself.
 *
 * Send **labels, not ids**: `severity: "Serious"`, never `"serious"`, and the
 * classification answers as the displayed `"Yes"` / `"No"` rather than
 * booleans. The model reads these as prose. Blank fields are omitted rather
 * than sent as empty strings.
 */
export type IncidentDraftRequestDto = {
  /**
   * The reporter's own description, when they have written one. Sending it
   * makes the response's `description` null — the backend will not overwrite
   * an account a human has already given.
   */
  description?: string;

  /* What happened */
  severity?: string;
  site?: string;
  location?: string;
  /** ISO-8601 UTC. */
  incidentAt?: string;
  workRelated?: string;
  fleetVehicleInvolved?: string;
  thirdPartyInvolved?: string;
  emergencyServicesCalled?: string;
  seriousIncident?: string;

  /* Details */
  mechanismOfInjury?: string;
  natureOfInjury?: string;
  objectInvolved?: string;
  initialTreatment?: string;

  /* People & injury */
  /** Comma-separated when several. */
  injuredBodyPart?: string;
  injuryLevel?: string;
};

/** Longest text the rewrite endpoints accept, mirroring the backend's [MaxLength]. */
export const AI_TEXT_MAX_CHARS = 8000;

/**
 * Body for POST /api/v1/near-misses/ai/draft-assist.
 *
 * Every field optional, but a request with all of them blank is a 400 — it is
 * rejected before any upstream call, so don't fire one to see what happens.
 *
 * `narrative` comes back null unless at least one contributing factor is given.
 * Padding two dropdown values into a sentence produces a restatement of what
 * the reporter just picked, dressed as an observation.
 */
export type NearMissDraftRequestDto = {
  /** As the reporter sees it — "7 August 2026", not an ISO string. */
  dateOfEvent?: string;
  hazardType?: string;
  location?: string;
  /** Max 20. */
  contributingFactors?: string[];
};

/**
 * Body for POST /api/v1/hazards/ai/draft-assist.
 *
 * `narrative` comes back null unless `potentialConsequence` is given — type and
 * location alone are below the threshold.
 */
export type HazardDraftRequestDto = {
  hazardType?: string;
  location?: string;
  /** Max 500 characters. */
  potentialConsequence?: string;
};
