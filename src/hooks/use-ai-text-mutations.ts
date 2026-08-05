"use client";

import { useMutation } from "@tanstack/react-query";
import type { IncidentDraftRequestDto } from "@/dtos/req/ai-text-request.dto";
import { draftIncidentAssist, proofreadText } from "@/services/ai-text.service";

/**
 * Proofread one field's text. Nothing is cached or invalidated: the result goes
 * straight back into the form the reporter is typing, and only if they accept
 * it.
 */
export function useProofreadMutation() {
  return useMutation({
    mutationFn: (text: string) => proofreadText(text),
  });
}

/**
 * Generate the step 3 and step 4 drafts from the step 2 description.
 *
 * Deliberately not retried. The reporter never asked for this call, so a
 * failure has to stay silent — retrying would just spend their time and our
 * tokens on something they cannot see failing.
 */
export function useDraftAssistMutation() {
  return useMutation({
    mutationFn: (input: Readonly<IncidentDraftRequestDto>) =>
      draftIncidentAssist(input),
    retry: false,
  });
}
