/** The two rewrite styles offered by the magic button on long-text fields. */
export type AiTextMode = "paraphrase" | "proofread";

/**
 * Matches backend body for POST /api/Incident/proofread — the route that
 * proxies ChatGPT 5.6 Luna (gpt-5.6-luna). The key never touches the browser:
 * we post the reporter's text to our own API and the backend talks to the
 * model. Deliberately generic (no incident fields) — the same endpoint is
 * reused as-is for NearMiss, Hazard, WalkTalk and BBS.
 */
export type RewriteTextRequestDto = {
  /** Required, max 8000 chars. */
  text: string;
};
