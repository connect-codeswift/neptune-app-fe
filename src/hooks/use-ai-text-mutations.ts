"use client";

import { useMutation } from "@tanstack/react-query";
import type { AiTextMode } from "@/dtos/req/ai-text-request.dto";
import { rewriteText } from "@/services/ai-text.service";

/**
 * Paraphrase or proofread a single field's text. Nothing is cached or
 * invalidated: the result goes straight back into the form the user is typing.
 */
export function useRewriteTextMutation() {
  return useMutation({
    mutationFn: (
      input: Readonly<{ text: string; mode: AiTextMode; context?: string }>,
    ) => rewriteText(input),
  });
}
