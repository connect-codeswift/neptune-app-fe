"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteIncidentDraft,
  getIncidentDraft,
  getIncidentDrafts,
  saveIncidentDraft,
} from "@/services/incident-draft.service";
import type { SaveIncidentDraftRequestDto } from "@/dtos/req/incident-draft-request.dto";

export const incidentDraftQueryKeys = {
  all: ["incident-drafts"] as const,
  byId: (draftId: string) => ["incident-drafts", draftId] as const,
};

/**
 * The reporter's own unfinished reports, newest save first.
 *
 * <p>Whose drafts these are is decided from the token by the API, so there is no
 * user id to pass and nothing here to scope.</p>
 */
export function useIncidentDraftsQuery(enabled = true) {
  return useQuery({
    queryKey: incidentDraftQueryKeys.all,
    enabled,
    queryFn: getIncidentDrafts,
  });
}

/** One draft, whole, for resuming the wizard. */
export function useIncidentDraftQuery(draftId: string | null) {
  return useQuery({
    queryKey: incidentDraftQueryKeys.byId(draftId ?? ""),
    enabled: Boolean(draftId),
    queryFn: () => getIncidentDraft(draftId as string),
    // A resumed draft is read once, into local form state. Refetching it behind
    // the reporter would either do nothing or overwrite what they have since
    // typed, and the second is a good way to lose someone's work.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export type SaveIncidentDraftInput = Readonly<{
  draftId: string;
  body: SaveIncidentDraftRequestDto;
}>;

export function useSaveIncidentDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveIncidentDraftInput) =>
      saveIncidentDraft(input.draftId, input.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: incidentDraftQueryKeys.all,
      });
    },
  });
}

export function useDeleteIncidentDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => deleteIncidentDraft(draftId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: incidentDraftQueryKeys.all,
      });
    },
  });
}
