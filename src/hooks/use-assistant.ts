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
 * Only the rail is invalidated on success, not the thread. The reply is already in hand and the
 * component has appended it — refetching the thread here would swap the rendered answer for an
 * identical one fetched again, and make a slow call slower for no visible change.
 */
export function useAskAssistantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      payload: AskAssistantRequestDto;
      conversationId?: number;
    }) => askAssistant(vars.payload, vars.conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.conversations(),
      });
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
