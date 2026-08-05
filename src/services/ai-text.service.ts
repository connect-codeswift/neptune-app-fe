import {
  AI_TEXT_MAX_CHARS,
  type IncidentDraftRequestDto,
  type ProofreadRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import type {
  IncidentDraftResultDto,
  ProofreadResultDto,
} from "@/dtos/res/ai-text-response.dto";
import http from "@/lib/axios";

const PROOFREAD_PATH = "/Incident/proofread";
const DRAFT_ASSIST_PATH = "/Incident/draft-assist";

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
        return "rate limited — 12 assist calls/min per user; check the Retry-After header";
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
    console.warn(`[ai-assist] ${label} failed (${error.status ?? "no status"}): ${error.diagnostic}`);
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

/** Cleans up grammar and clarity without changing meaning. Never persists. */
export async function proofreadText(text: string): Promise<string> {
  const body: ProofreadRequestDto = { text: text.slice(0, AI_TEXT_MAX_CHARS) };

  try {
    const { data } = await http.post<unknown>(PROOFREAD_PATH, body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const result = unwrapDataModel(data) as ProofreadResultDto | null;
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
 * Injury description, action notes and follow-up suggestions in one call,
 * fired when the reporter leaves step 2. One call rather than three keeps the
 * drafts consistent with each other and avoids a per-field round trip.
 */
export async function draftIncidentAssist(
  input: Readonly<IncidentDraftRequestDto>,
): Promise<IncidentDraftResultDto> {
  const body: IncidentDraftRequestDto = {
    description: input.description.slice(0, AI_TEXT_MAX_CHARS),
  };

  // Omitted entirely when blank rather than sent as an empty label the model
  // then has to interpret.
  if (input.severity?.trim()) {
    body.severity = input.severity.trim();
  }

  if (input.location?.trim()) {
    body.location = input.location.trim();
  }

  if (input.incidentAt) {
    body.incidentAt = input.incidentAt;
  }

  try {
    const { data } = await http.post<unknown>(DRAFT_ASSIST_PATH, body, {
      timeout: AI_REQUEST_TIMEOUT_MS,
    });

    const result = unwrapDataModel(data);

    if (!isRecord(result)) {
      throw new AiAssistError();
    }

    const followUps = Array.isArray(result.suggestedFollowUps)
      ? result.suggestedFollowUps
          .filter(
            (item): item is string =>
              typeof item === "string" && item.trim() !== "",
          )
          .map((item) => item.trim())
      : [];

    return {
      injuryDescription: readString(result, "injuryDescription"),
      actionNotes: readString(result, "actionNotes"),
      suggestedFollowUps: followUps,
    };
  } catch (error) {
    throw error instanceof AiAssistError
      ? error
      : new AiAssistError(toStatus(error));
  }
}
