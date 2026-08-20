"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AskAssistantRequestDto } from "@/dtos/req/assistant-request.dto";
import {
  askAssistant,
  dropAssistantConversation,
  getAssistantConversation,
  getAssistantConversations,
} from "@/services/assistant.service";

export const assistantQueryKeys = {
  all: ["assistant"] as const,
  conversations: () => [...assistantQueryKeys.all, "conversations"] as const,
  conversation: (id: number) =>
    [...assistantQueryKeys.all, "conversation", id] as const,
};

/** The conversation rail. */
export function useAssistantConversationsQuery(enabled = true) {
  return useQuery({
    queryKey: assistantQueryKeys.conversations(),
    queryFn: () => getAssistantConversations(),
    enabled,
  });
}

/** One thread's stored turns, for reopening it from the rail. */
export function useAssistantConversationQuery(
  conversationId: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: assistantQueryKeys.conversation(conversationId ?? 0),
    queryFn: () => getAssistantConversation(conversationId as number),
    enabled: enabled && conversationId !== null && conversationId > 0,
  });
}

/**
 * Asks a question.
 *
 * Invalidates the rail and the answered thread. The page keeps rendering the reply it already
 * holds and drops it only once the refetched thread contains the stored copy, so the refetch
 * never causes a visible swap — it just brings the cache back in line.
 */
export function useAskAssistantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      payload: AskAssistantRequestDto;
      conversationId?: number;
    }) => askAssistant(vars.payload, vars.conversationId),
    onSuccess: async (reply) => {
      await queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.conversations(),
      });

      if (reply) {
        await queryClient.invalidateQueries({
          queryKey: assistantQueryKeys.conversation(reply.conversationId),
        });
      }
    },
  });
}

export function useDropAssistantConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: number) =>
      dropAssistantConversation(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.all,
      });
    },
  });
}
