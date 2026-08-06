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
 * Turn the reporter's own answers into a first draft of the description.
 *
 * Uses `proofread` rather than `draft-assist` because the API has no endpoint
 * that writes a description from structured fields — `draft-assist` runs the
 * other way, taking a description and producing the injury and action drafts
 * from it. So the facts are composed here and the model is asked only to make
 * them read well, which also keeps it on the one job it is documented to do:
 * fix wording without changing meaning.
 *
 * Not retried, for the same reason as `useDraftAssistMutation` — the reporter
 * never asked for this call.
 */
export function useDescriptionDraftMutation() {
  return useMutation({
    mutationFn: (facts: string) => proofreadText(facts),
    retry: false,
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
