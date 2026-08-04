import type {
  AiTextMode,
  RewriteTextRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import { getAuthContext } from "@/lib/auth-context";
import http from "@/lib/axios";

/**
 * Backend route that proxies ChatGPT 5.6 Luna.
 *
 * The path is a guess at the backend's naming (it follows the /Hazard/GetAllHazard
 * house style) because the endpoint was not published when this shipped — point
 * NEXT_PUBLIC_AI_REWRITE_PATH at the real route and nothing else has to change.
 */
const AI_REWRITE_TEXT_PATH =
  process.env.NEXT_PUBLIC_AI_REWRITE_PATH ?? "/Ai/RewriteText";

const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL ?? "gpt-5.6-luna";

/**
 * Model calls routinely outrun the 30s default on `http`, and a timeout here
 * reads to the reporter as "the AI is broken".
 */
const AI_REQUEST_TIMEOUT_MS = 60_000;

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
    "text",
    "Text",
    "rewrittenText",
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

/** Sends one field's text to the model and returns the rewrite. */
export async function rewriteText(
  input: Readonly<{ text: string; mode: AiTextMode; context?: string }>,
) {
  const auth = getAuthContext();

  const payload: RewriteTextRequestDto = {
    text: input.text,
    mode: input.mode,
    model: AI_MODEL,
    context: input.context,
    userId: auth?.userId ?? 0,
    subCompanyId: auth?.subCompanyId ?? 0,
  };

  const { data } = await http.post<unknown>(AI_REWRITE_TEXT_PATH, payload, {
    timeout: AI_REQUEST_TIMEOUT_MS,
  });

  const rewritten = readRewrittenText(data);

  if (!rewritten) {
    throw new Error("The assistant sent back an empty rewrite.");
  }

  return rewritten;
}
