import type {
  ApiEnvelopeDto,
  PagedDataDto,
} from "@/dtos/res/api-envelope.dto.ts";
import type {
  ChatChart,
  ChatInsights,
  ChatResultCard,
  ChatTable,
} from "@/components/neptune-ai/neptune-ai-data";

/**
 * One row in the conversation rail.
 *
 * GET /api/v1/assistant/conversations
 *
 * Threads are private to whoever started them — this only ever returns your own, and another
 * user's conversation is a 404 rather than a 403.
 */
export type AssistantConversationSummaryDto = {
  id: number;
  title: string;
  lastMessageAt: string;
  preview: string | null;
};

/**
 * One stored turn. The block fields mirror the chat renderer's own types exactly, so a reply
 * from the API drops into `ChatMessage` without a mapping layer.
 */
export type AssistantMessageDto = {
  id: number;
  author: "ai" | "user";
  authorName: string;
  body: string;
  results?: ChatResultCard[] | null;
  chart?: ChatChart | null;
  table?: ChatTable | null;
  insights?: ChatInsights | null;
  createdAt: string;
};

/** A thread with its turns. GET /api/v1/assistant/conversations/{id} */
export type AssistantConversationDto = {
  id: number;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  messages: AssistantMessageDto[];
};

/**
 * The answer to one question.
 *
 * `conversationId` matters on the first question of a thread: the backend creates the thread and
 * this is the only place its id appears, so a client that drops it has no way to ask a follow-up.
 */
export type AssistantReplyDto = {
  conversationId: number;
  title: string;
  message: AssistantMessageDto;
};

export type GetAssistantConversationsResponseDto = ApiEnvelopeDto<PagedDataDto<AssistantConversationSummaryDto> | null>;

export type GetAssistantConversationResponseDto = ApiEnvelopeDto<AssistantConversationDto | null>;

export type AskAssistantResponseDto = ApiEnvelopeDto<AssistantReplyDto | null>;
