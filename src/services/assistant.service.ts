import type { AskAssistantRequestDto } from "@/dtos/req/assistant-request.dto";
import type {
  AssistantConversationDto,
  AssistantConversationSummaryDto,
  AssistantReplyDto,
} from "@/dtos/res/assistant-response.dto";
import http from "@/lib/axios";

const ASSISTANT_PATH = "/assistant/conversations";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrap(data: unknown): unknown {
  return isRecord(data) ? data.dataModel : undefined;
}

/** GET /api/v1/assistant/conversations — the rail, newest activity first, yours only. */
export async function getAssistantConversations(
  pageNumber = 1,
  pageSize = 30,
): Promise<AssistantConversationSummaryDto[]> {
  const { data } = await http.get<unknown>(ASSISTANT_PATH, {
    params: { pageNumber, pageSize },
  });

  const payload = unwrap(data);

  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data as AssistantConversationSummaryDto[];
}

/** GET /api/v1/assistant/conversations/{id} — a thread and its turns. 404 if it is not yours. */
export async function getAssistantConversation(
  conversationId: number,
): Promise<AssistantConversationDto | null> {
  const { data } = await http.get<unknown>(
    `${ASSISTANT_PATH}/${String(conversationId)}`,
  );

  const payload = unwrap(data);

  return isRecord(payload) ? (payload as AssistantConversationDto) : null;
}

/**
 * Asks a question.
 *
 * Omit `conversationId` to start a thread; the id of the new thread comes back on the reply.
 *
 * This is a slow call by nature — the assistant may run several database reads before it answers,
 * and the backend allows it up to 120 seconds. Callers should show progress rather than a spinner
 * that looks stuck, and must not race two questions into the same thread.
 */
export async function askAssistant(
  payload: AskAssistantRequestDto,
  conversationId?: number,
): Promise<AssistantReplyDto | null> {
  const path =
    conversationId === undefined
      ? `${ASSISTANT_PATH}/messages`
      : `${ASSISTANT_PATH}/${String(conversationId)}/messages`;

  const { data } = await http.post<unknown>(path, {
    message: payload.message.trim(),
  });

  const reply = unwrap(data);

  return isRecord(reply) ? (reply as AssistantReplyDto) : null;
}

/** DELETE /api/v1/assistant/conversations/{id} — soft delete, and only your own. */
export async function dropAssistantConversation(conversationId: number) {
  const { data } = await http.delete<unknown>(
    `${ASSISTANT_PATH}/${String(conversationId)}`,
  );
  return data;
}
