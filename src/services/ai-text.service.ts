import {
  AI_TEXT_MAX_CHARS,
  type AiAssistFields,
  type AiAssistRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import http from "@/lib/axios";

/**
 * The two rewrite operations. Same request and response shape, same error
 * handling, same rate-limit bucket — they differ only in path and in what the
 * model is told to do, so they share one function rather than two near-copies.
 */
export type RewriteOperation = "proofread" | "paraphrase";

/** Which module's endpoints to call. */
export type AiModule =
  "incident" | "nearMiss" | "hazard" | "loto" | "sds" | "training" | "chemical";

/** Every AI call goes here; the module travels in the body. */
const AI_ASSIST_PATH = "/ai/assist";

/**
 * The record kind the backend knows this module by. It is not cosmetic — it
 * picks the prompt, the permission and the role set together.
 *
 * Permissions: each kind is gated on its own module's `.Create`, and the
 * incident gate excludes Worker — a Worker reporting a hazard under
 * `recordKind: "incident"` would get a 403 on a form they are allowed to
 * submit.
 *
 * Tense: a near miss is over, so its rewrites come back in the past tense; a
 * hazard is a condition that still exists, so its rewrites stay in the present.
 * Sending hazard text under the near-miss kind returns "a large puddle of oil
 * *was* under the press", which reads as already dealt with on a report whose
 * whole point is that it is not.
 */
const RECORD_KINDS = {
  incident: "incident",
  nearMiss: "near-miss",
  hazard: "hazard",
  loto: "lockout/tagout procedure",
  sds: "safety data sheet",
  training: "chemical safety training session",
  chemical: "chemical inventory record",
} satisfies Record<AiModule, string>;

/**
 * Model calls run 3-4s in practice against a 30s server-side ceiling. The
 * default axios timeout would cut in before the server gave up, turning a slow
 * answer into a client error, so these two calls get their own headroom.
 */
const AI_REQUEST_TIMEOUT_MS = 45_000;

/**
 * Every failure here is shown to the reporter the same way, so callers never
 * need the backend's own text — and must not use it. A timeout is not thrown as
 * an AppException, so it arrives as a 500 whose `Message` is a raw .NET string
 * ("The request was canceled due to the configured HttpClient.Timeout…").
 * Surfacing that verbatim is how internals leak into a safety form.
 */
class AiAssistError extends Error {
  readonly status?: number;

  /**
   * True when the backend refused the answer rather than failing to get one:
   * the field held an instruction to the model rather than report text, and
   * the rewrite came back unrelated to what was sent. The reporter needs
   * different copy for this — nothing is broken, their text is simply not
   * something the assistant will rewrite.
   */
  get isRejectedContent(): boolean {
    return this.status === 422;
  }

  constructor(status?: number) {
    super("The assistant is unavailable right now.");
    this.name = "AiAssistError";
    this.status = status;
  }

  /**
   * What actually went wrong, for the console only — never for the reporter.
   * Without this the fixed toast copy is all anyone gets, and a missing API key
   * (503), a rate limit (429) and a model timeout are indistinguishable from
   * each other and from a bug in this file.
   */
  get diagnostic(): string {
    switch (this.status) {
      case 401:
      case 403:
        return "not authorised — token expired, or the role lacks the module's permission (Incident.Create / NearMiss.Create / Hazard.Create / Loto.Create)";
      case 422:
        return "the answer bore no relation to the text sent — most likely an instruction typed into the field rather than report content";
      case 429:
        return "rate limited — 20 assist calls/min per user, shared across proofread, paraphrase and draft-assist; check the Retry-After header";
      case 503:
        return "Ai__ApiKey is not set on this environment, so the endpoint is inert";
      case 500:
        return "server error, most likely the 30s model timeout";
      case undefined:
        return "no response — network, CORS, or the client's own 45s timeout";
      default:
        return `unexpected status ${this.status}`;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Unwraps the standard envelope. Error responses from the global middleware are
 * serialized with .NET's default naming while success responses are camelCase,
 * so both spellings are tolerated rather than assumed.
 */
function unwrapDataModel(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return null;
  }

  return payload.dataModel ?? payload.DataModel ?? null;
}

function readString(source: unknown, key: string): string | null {
  if (!isRecord(source)) {
    return null;
  }

  const value = source[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Pulls the `results` map out of the envelope.
 *
 * Every AI answer now arrives the same way — `{ results: { <field>: string |
 * null } }` — because which fields exist is a property of the record kind's
 * prompt rather than of the wire type. A null value is a real answer ("nothing
 * worth drafting here"), so it is preserved rather than treated as missing.
 */
function readResults(payload: unknown): Record<string, string | null> | null {
  const model = unwrapDataModel(payload);

  if (!isRecord(model)) {
    return null;
  }

  const results = model.results ?? model.Results;

  if (!isRecord(results)) {
    return null;
  }

  const out: Record<string, string | null> = {};

  for (const key of Object.keys(results)) {
    out[key] = readString(results, key);
  }

  return out;
}

/** One field out of that map, for the callers that only ever want one. */
function readResult(payload: unknown, key: string): string | null {
  return readResults(payload)?.[key] ?? null;
}

/**
 * Whether the assistant refused the content rather than failing on it. Callers
 * show "that is not report text" instead of "try again in a moment" — retrying
 * an instruction typed into a field will fail the same way every time.
 */
export function isRejectedByAssistant(error: unknown): boolean {
  return error instanceof AiAssistError && error.isRejectedContent;
}

/**
 * Logs why an assist call failed. The reporter is shown fixed copy either way,
 * so this is the only place the cause is recoverable from a running app.
 */
export function logAiAssistFailure(label: string, error: unknown): void {
  if (error instanceof AiAssistError) {
    console.warn(
      `[ai-assist] ${label} failed (${error.status ?? "no status"}): ${error.diagnostic}`,
    );
    return;
  }

  console.warn(`[ai-assist] ${label} failed:`, error);
}

function toStatus(error: unknown): number | undefined {
  if (isRecord(error) && typeof error.status === "number") {
    return error.status;
  }

  return undefined;
}

/**
 * Rewrites one field's text. Never persists.
 *
 * `proofread` corrects spelling, grammar and punctuation only — it does not
 * restructure, and returns the text unchanged when nothing is wrong.
 * `paraphrase` rewrites more freely: run-ons merged, events ordered
 * chronologically, casual phrasing lifted into report register and blame
 * language removed, with every fact and every hedge preserved.
 */
export async function rewriteText(
  module: AiModule,
  operation: RewriteOperation,
  text: string,
  contextFields?: Readonly<AiAssistFields>,
): Promise<string> {
  const body: AiAssistRequestDto = {
    recordKind: RECORD_KINDS[module],
    operation,
    text: text.slice(0, AI_TEXT_MAX_CHARS),
  };

  // The answers from the rest of the form. Without them a rewrite reads one
  // textarea in isolation: it cannot tell which "press" is meant, and it spells
  // a location differently from the field directly above it. The backend uses
  // them to read the text, never to fold their content into it.
  if (contextFields) {
    const present: AiAssistFields = {};

    for (const [label, value] of Object.entries(contextFields)) {
      if (value.trim()) {
        present[label] = value.trim();
      }
    }

    if (Object.keys(present).length > 0) {
      body.fields = present;
    }
  }

  try {
    const { data } = await http.post<unknown>(AI_ASSIST_PATH, body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const rewritten = readResult(data, "text");

    if (!rewritten) {
      throw new AiAssistError();
    }

    return rewritten;
  } catch (error) {
    throw error instanceof AiAssistError
      ? error
      : new AiAssistError(toStatus(error));
  }
}

/**
 * Drafts a long-text field from the answers the reporter has given.
 *
 * Pass `targetField` to draft one field; omit it to get every field this record
 * kind produces. An incident produces `description`, `injuryDescription` and
 * `actionNotes`; a near miss or hazard produces `narrative`. A missing or null
 * key means "nothing to draft" — a real answer for a sparse form, not a
 * failure.
 *
 * `fields` is keyed by the label the form shows, because the model reads those
 * keys as prose. Blanks are dropped rather than sent as empty strings: an empty
 * label reads as a fact about the record, not as an absent one.
 */
export async function draftFields(
  module: AiModule,
  fields: Readonly<AiAssistFields>,
  options: Readonly<{ targetField?: string; authoredText?: string }> = {},
): Promise<Record<string, string | null>> {
  const present: AiAssistFields = {};

  for (const [label, value] of Object.entries(fields)) {
    if (value.trim()) {
      present[label] = value.trim();
    }
  }

  const body: AiAssistRequestDto = {
    recordKind: RECORD_KINDS[module],
    operation: "draft",
    fields: present,
  };

  // Ask for the one field being filled, so the call is not paying for drafts
  // the caller will discard.
  if (options.targetField !== undefined) {
    body.targetField = options.targetField;
  }

  // Sent only by the forms that draft a description alongside the reporter's
  // own account, and for them "" and undefined mean different things — "" says
  // they have not written one yet, which is what lets the model offer one.
  if (options.authoredText !== undefined) {
    body.text = options.authoredText.slice(0, AI_TEXT_MAX_CHARS);
  }

  try {
    const { data } = await http.post<unknown>(AI_ASSIST_PATH, body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const results = readResults(data);

    if (results === null) {
      throw new AiAssistError();
    }

    return results;
  } catch (error) {
    throw error instanceof AiAssistError
      ? error
      : new AiAssistError(toStatus(error));
  }
}
