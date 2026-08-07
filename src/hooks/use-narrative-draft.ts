"use client";

import { useEffect, useState } from "react";
import type {
  HazardDraftRequestDto,
  NearMissDraftRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import { useNarrativeDraftMutation } from "@/hooks/use-ai-text-mutations";
import { logAiAssistFailure, type AiModule } from "@/services/ai-text.service";

/**
 * A checkbox group fires an onChange per tick. Without this, selecting three
 * contributing factors spends three calls from a bucket of 20 a minute that
 * Incident, Near Miss and Hazard all share — for one draft.
 */
const DRAFT_DEBOUNCE_MS = 900;

export type NarrativeDraftState = Readonly<{
  /** The drafted text, or null when there is nothing to offer. */
  draft: string | null;
  pending: boolean;
  /** Clears the draft and stops it being offered again for these answers. */
  dismiss: () => void;
}>;

/**
 * Drafts the narrative on a single-page report form from the answers above it.
 *
 * The rules are the incident wizard's, adapted from a wizard to one page:
 *
 * - Fires only when `enabled` — the caller's threshold, which is at least one
 *   contributing factor on Near Miss and a potential consequence on Hazard.
 *   Below those the backend returns null anyway (§3 of the guide), so firing
 *   would spend a call to be told nothing.
 * - Fingerprinted on the request, so re-ticking the same box costs nothing.
 * - Never retried and never surfaced. The reporter did not ask for this call,
 *   so a failure leaves the field exactly as it would be without the feature —
 *   which is also what happens on any environment where `Ai__ApiKey` is unset
 *   and all six endpoints answer 503.
 */
export function useNarrativeDraft(
  options: Readonly<{
    module: Extract<AiModule, "nearMiss" | "hazard">;
    input: Readonly<NearMissDraftRequestDto | HazardDraftRequestDto>;
    enabled: boolean;
  }>,
): NarrativeDraftState {
  const { module, input, enabled } = options;

  const draftMutation = useNarrativeDraftMutation(module);
  const [state, setState] = useState<
    Readonly<{
      text: string | null;
      pending: boolean;
      source: string;
      dismissed: boolean;
    }>
  >({ text: null, pending: false, source: "", dismissed: false });

  const key = JSON.stringify(input);
  const wants =
    enabled && !state.dismissed && !state.pending && key !== state.source;

  useEffect(() => {
    if (!wants) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      setState((prev) => ({ ...prev, pending: true, source: key }));

      draftMutation
        .mutateAsync(JSON.parse(key) as NearMissDraftRequestDto)
        .then((narrative) => {
          // Null is an answer — the answers given don't support a draft. It
          // renders as nothing at all, not as an empty slot.
          setState({
            text: narrative,
            pending: false,
            source: key,
            dismissed: false,
          });
        })
        .catch((error: unknown) => {
          logAiAssistFailure(`${module}-draft-assist`, error);
          setState({
            text: null,
            pending: false,
            source: key,
            dismissed: false,
          });
        });
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
    // The mutation object changes identity every render; including it would
    // restart the debounce on each keystroke behind the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wants, key, module]);

  return {
    // Gated on `enabled` rather than cleared by an effect: the caller turns it
    // off the moment the reporter types, so the ghost disappears on the same
    // render as their first keystroke. Clearing state instead would need an
    // effect, and would throw away a draft that is still valid if they undo
    // that keystroke.
    draft: enabled ? state.text : null,
    pending: enabled && state.pending,
    dismiss: () => {
      setState((prev) => ({ ...prev, text: null, dismissed: true }));
    },
  };
}
