"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HazardDraftRequestDto,
  NearMissDraftRequestDto,
} from "@/dtos/req/ai-text-request.dto";
import { useNarrativeDraftMutation } from "@/hooks/use-ai-text-mutations";
import { logAiAssistFailure, type AiModule } from "@/services/ai-text.service";

/**
 * A checkbox group fires an onChange per tick. Without this, ticking three
 * contributing factors inside a second would spend three calls from a bucket of
 * 20 a minute that Incident, Near Miss and Hazard all share — for one draft.
 *
 * It only coalesces changes made within the window, which is why it is not on
 * its own enough: see `drafted` below.
 */
const DRAFT_DEBOUNCE_MS = 900;

export type NarrativeDraftState = Readonly<{
  /** The drafted text, or null when there is nothing to offer. */
  draft: string | null;
  pending: boolean;
  /** Clears the draft and stops it being offered again for these answers. */
  dismiss: () => void;
  /** Draft again from the answers as they now stand. The reporter's call. */
  regenerate: () => void;
  /** Whether asking for another draft is meaningful right now. */
  canRegenerate: boolean;
}>;

type DraftState = Readonly<{
  text: string | null;
  pending: boolean;
  /** Fingerprint of the answers the last request was built from. */
  source: string;
  dismissed: boolean;
  /** A draft has been fetched for this form; the automatic pass is spent. */
  drafted: boolean;
}>;

const EMPTY_DRAFT_STATE: DraftState = {
  text: null,
  pending: false,
  source: "",
  dismissed: false,
  drafted: false,
};

/**
 * Drafts the narrative on a single-page report form from the answers above it.
 *
 * The rules are the incident wizard's, adapted from a wizard to one page:
 *
 * - Fires only when `enabled` — the caller's threshold, which is at least one
 *   contributing factor on Near Miss and a potential consequence on Hazard.
 *   Below those the backend returns null anyway (§3 of the guide), so firing
 *   would spend a call to be told nothing.
 * - **Once.** The automatic pass is spent on the first request and never fires
 *   again, however many answers change afterwards. It was keyed on a
 *   fingerprint of every answer, so a reporter who paused between two dropdowns
 *   outran the debounce and bought a draft per dropdown — each one discarded
 *   unseen when the next answer landed. Changing an answer now leaves the draft
 *   alone and `regenerate` is theirs to press.
 * - Never retried and never surfaced. The reporter did not ask for the
 *   automatic call, so a failure leaves the field exactly as it would be
 *   without the feature — which is also what happens on any environment where
 *   `Ai__ApiKey` is unset and all six endpoints answer 503.
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
  const [state, setState] = useState<DraftState>(EMPTY_DRAFT_STATE);

  const key = JSON.stringify(input);

  // The mutation object is a new identity on every render. Held in a ref so
  // `fetchDraft` can be stable, and so listing it as a dependency below cannot
  // restart the debounce on each keystroke behind the field.
  const mutateRef = useRef(draftMutation.mutateAsync);
  useEffect(() => {
    mutateRef.current = draftMutation.mutateAsync;
  });

  const fetchDraft = useCallback(
    (requestKey: string) => {
      setState((prev) => ({
        ...prev,
        pending: true,
        source: requestKey,
        dismissed: false,
      }));

      mutateRef
        .current(JSON.parse(requestKey) as NearMissDraftRequestDto)
        .then((narrative) => {
          // Null is an answer — the answers given don't support a draft. It
          // renders as nothing at all, not as an empty slot.
          setState((prev) => ({
            ...prev,
            // A reporter who dismissed while this was in flight meant it. The
            // landing response used to reopen the ghost they had just closed.
            text: prev.dismissed ? null : narrative,
            pending: false,
            source: requestKey,
            drafted: true,
          }));
        })
        .catch((error: unknown) => {
          logAiAssistFailure(`${module}-draft-assist`, error);
          // `drafted` is set on failure too. The call still cost a slot out of
          // the per-minute budget, and retrying it on the reporter's next
          // answer would spend the rest of them the same way.
          setState((prev) => ({
            ...prev,
            text: null,
            pending: false,
            source: requestKey,
            drafted: true,
          }));
        });
    },
    [module],
  );

  const wants =
    enabled &&
    !state.drafted &&
    !state.dismissed &&
    !state.pending &&
    key !== state.source;

  useEffect(() => {
    if (!wants) {
      return;
    }

    const timer = globalThis.setTimeout(() => {
      fetchDraft(key);
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [wants, key, fetchDraft]);

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
    regenerate: () => {
      if (!state.pending) {
        fetchDraft(key);
      }
    },
    // Only once the automatic pass has run: before that the draft is still
    // coming on its own, and offering to fetch it again would be the same call
    // twice. Still gated on `enabled`, so it is never offered over words the
    // reporter has written themselves.
    canRegenerate: enabled && state.drafted && !state.pending,
  };
}
