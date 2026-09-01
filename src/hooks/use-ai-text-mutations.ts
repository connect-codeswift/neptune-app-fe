"use client";

import { useMutation } from "@tanstack/react-query";
import type { AiAssistFields } from "@/dtos/req/ai-text-request.dto";
import {
  draftFields,
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
      input: Readonly<{
        operation: RewriteOperation;
        text: string;
        contextFields?: AiAssistFields;
      }>,
    ) => rewriteText(module, input.operation, input.text, input.contextFields),
  });
}

/**
 * Draft this record's long-text fields from whatever the reporter has filled in
 * so far.
 *
 * One hook for every module: which keys come back is a property of the record
 * kind's prompt, not of the caller — an incident answers with three, a near
 * miss or hazard with one.
 *
 * Deliberately not retried. Where this still fires on its own (hazard and near
 * miss), the reporter never asked for the call, so a failure has to stay silent
 * — retrying would just spend their time and our share of the 20/min ceiling on
 * something they cannot see failing.
 */
export function useDraftMutation(module: AiModule) {
  return useMutation({
    mutationFn: (
      input: Readonly<{
        fields: AiAssistFields;
        targetField?: string;
        authoredText?: string;
      }>,
    ) =>
      draftFields(module, input.fields, {
        targetField: input.targetField,
        authoredText: input.authoredText,
      }),
    retry: false,
  });
}
