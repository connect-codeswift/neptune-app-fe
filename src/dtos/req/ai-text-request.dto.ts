/** The two rewrite styles offered by the magic button on long-text fields. */
export type AiTextMode = "paraphrase" | "proofread";

/**
 * Matches backend body for POST /api/Ai/RewriteText — the route that proxies
 * ChatGPT 5.6 Luna. The key never touches the browser: we post the reporter's
 * text to our own API and the backend talks to the model.
 */
export type RewriteTextRequestDto = {
  text: string;
  mode: AiTextMode;
  /** Model id the backend should route to, e.g. "gpt-5.6-luna". */
  model: string;
  /** What the text is for, so the model keeps the right register. */
  context?: string;
  userId: number;
  subCompanyId: number;
};
