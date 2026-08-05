import type {
  AiTextMode,
  RewriteTextRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import http, { isApiError } from "@/lib/axios";

/**
 * POST /api/Incident/proofread — generic AI writing assist, backed by
 * ChatGPT 5.6 Luna (gpt-5.6-luna) behind our own API. Suggest-only: the
 * call persists nothing, and auth rides on the axios interceptor.
 */
const INCIDENT_PROOFREAD_PATH = "/Incident/proofread";

/**
 * The server doesn't give up on the model call until 30s, so the client waits
 * a little past that — a shorter timeout here would read to the reporter as
 * "the AI is broken" while the backend was still about to answer.
 */
const AI_REQUEST_TIMEOUT_MS = 45_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Pulls the rewritten text out of the response, tolerating both the standard
 * `dataModel` envelope and a bare string, and the handful of field names the
 * backend might land on.
 */
function readRewrittenText(payload: unknown): string | null {
  if (typeof payload === "string") {
    return payload.trim() === "" ? null : payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const unwrapped = payload.dataModel ?? payload.DataModel ?? payload;

  if (typeof unwrapped === "string") {
    return unwrapped.trim() === "" ? null : unwrapped;
  }

  if (!isRecord(unwrapped)) {
    return null;
  }

  const candidateKeys = [
    "rewrittenText",
    "text",
    "Text",
    "rewritten",
    "result",
    "output",
    "content",
  ];

  for (const key of candidateKeys) {
    const value = unwrapped[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return null;
}

/**
 * Sends one field's text to the model and returns the rewrite.
 *
 * `mode` and `context` stay on the input so callers can describe intent, but
 * the backend contract takes only `text` — both menu options call the same
 * proofread endpoint.
 */
export async function rewriteText(
  input: Readonly<{ text: string; mode: AiTextMode; context?: string }>,
) {
  const payload: RewriteTextRequestDto = { text: input.text };

  let data: unknown;

  try {
    const response = await http.post<unknown>(
      INCIDENT_PROOFREAD_PATH,
      payload,
      { timeout: AI_REQUEST_TIMEOUT_MS },
    );
    data = response.data;
  } catch (error) {
    // 400/502/503 arrive as normal AppException envelopes, but a server-side
    // timeout comes back as a 500 whose `Message` is a raw .NET exception
    // string — never surface either verbatim. Nothing destructive happened to
    // the reporter's text, so a fixed retry message covers every failure.
    // The real status is logged for debugging: 503 means the AI key isn't
    // configured on this environment, which is a deliberate degradation.
    console.warn(
      "[ai-text] proofread failed:",
      isApiError(error)
        ? { status: error.status, data: error.data }
        : error,
    );
    throw new Error("Couldn't generate a suggestion. Please try again.");
  }

  const rewritten = readRewrittenText(data);

  if (!rewritten) {
    throw new Error("The assistant sent back an empty rewrite.");
  }

  return rewritten;
}
