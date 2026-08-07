"use client";

import { useMutation } from "@tanstack/react-query";
import type { IncidentDraftRequestDto } from "@/dtos/req/ai-text-request.dto";
import type {
  HazardDraftRequestDto,
  NearMissDraftRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import {
  draftIncidentAssist,
  draftNarrative,
  rewriteText,
  type AiModule,
  type RewriteOperation,
} from "@/services/ai-text.service";

/**
 * Rewrite one field's text, either operation. Nothing is cached or invalidated:
 * the result goes straight back into the form the reporter is typing, and only
 * if they accept it.
 *
 * One mutation covering both operations rather than one each, so a field can
 * only have a single rewrite in flight — firing proofread and paraphrase at
 * once would race two answers into the same box.
 */
export function useRewriteMutation(module: AiModule) {
  return useMutation({
    mutationFn: (
      input: Readonly<{ operation: RewriteOperation; text: string }>,
    ) => rewriteText(module, input.operation, input.text),
  });
}

/**
 * Draft the description, injury description and action notes from whatever the
 * reporter has filled in so far.
 *
 * Deliberately not retried. The reporter never asked for this call, so a
 * failure has to stay silent — retrying would just spend their time and our
 * share of the 20/min ceiling on something they cannot see failing.
 */
export function useDraftAssistMutation() {
  return useMutation({
    mutationFn: (input: Readonly<IncidentDraftRequestDto>) =>
      draftIncidentAssist(input),
    retry: false,
  });
}

/**
 * Draft the single narrative on the Near Miss or Hazard form.
 *
 * Same discipline as `useDraftAssistMutation` and for the same reason: the
 * reporter never asked for this call, so a failure stays silent and a retry
 * would only spend more of the 20/min bucket that all three modules share.
 */
export function useNarrativeDraftMutation(
  module: Extract<AiModule, "nearMiss" | "hazard">,
) {
  return useMutation({
    mutationFn: (
      input: Readonly<NearMissDraftRequestDto | HazardDraftRequestDto>,
    ) => draftNarrative(module, input),
    retry: false,
  });
}
