import {
  AI_TEXT_MAX_CHARS,
  type IncidentDraftRequestDto,
  type RewriteRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import type {
  IncidentDraftResultDto,
  RewriteResultDto,
} from "@/dtos/res/ai-text-response.dto";
import http from "@/lib/axios";

const DRAFT_ASSIST_PATH = "/Incident/draft-assist";

/**
 * The two rewrite operations. Same request and response shape, same error
 * handling, same rate-limit bucket — they differ only in path and in what the
 * model is told to do, so they share one function rather than two near-copies.
 */
export const REWRITE_PATHS = {
  proofread: "/Incident/proofread",
  paraphrase: "/Incident/paraphrase",
} as const;

export type RewriteOperation = keyof typeof REWRITE_PATHS;

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
export class AiAssistError extends Error {
  readonly status?: number;

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
        return "not authorised — token expired, or the role lacks Incident.Create";
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
  operation: RewriteOperation,
  text: string,
): Promise<string> {
  const body: RewriteRequestDto = { text: text.slice(0, AI_TEXT_MAX_CHARS) };

  try {
    const { data } = await http.post<unknown>(REWRITE_PATHS[operation], body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const result = unwrapDataModel(data) as RewriteResultDto | null;
    const rewritten = readString(result, "rewrittenText");

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
 * Description, injury description and action notes in one call.
 *
 * Every field is optional and blanks are dropped rather than sent as empty
 * strings the model then has to interpret — an empty label reads as a fact
 * about the incident, not as an absent one. An entirely empty body is a 400,
 * so callers must send something.
 */
export async function draftIncidentAssist(
  input: Readonly<IncidentDraftRequestDto>,
): Promise<IncidentDraftResultDto> {
  const body: IncidentDraftRequestDto = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim()) {
      body[key as keyof IncidentDraftRequestDto] =
        key === "description"
          ? value.slice(0, AI_TEXT_MAX_CHARS)
          : value.trim();
    }
  }

  if (input.injuredBodyPart?.trim()) {
    body.injuredBodyPart = input.injuredBodyPart.trim();
  }

  if (input.injuryLevel?.trim()) {
    body.injuryLevel = input.injuryLevel.trim();
  }

  try {
    const { data } = await http.post<unknown>(DRAFT_ASSIST_PATH, body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const result = unwrapDataModel(data);

    if (!isRecord(result)) {
      throw new AiAssistError();
    }

    return {
      description: readString(result, "description"),
      injuryDescription: readString(result, "injuryDescription"),
      actionNotes: readString(result, "actionNotes"),
    };
  } catch (error) {
    throw error instanceof AiAssistError
      ? error
      : new AiAssistError(toStatus(error));
  }
}
