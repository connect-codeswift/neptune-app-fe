"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AcknowledgeDocumentRequestDto,
  AddDocCategoryRequestDto,
  ApproveDocumentRequestDto,
  CreateDocumentRequestDto,
  UpdateDocumentRequestDto,
} from "@/dtos/req/document-request.dto";
import { documentQueryKeys } from "@/hooks/use-document-queries";
import {
  acknowledgeDocument,
  addDocCategory,
  approveDocument,
  createDocument,
  updateDocument,
} from "@/services/document.service";

export function useCreateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentRequestDto) => createDocument(payload),
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: documentQueryKeys.all,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

/** PUT /api/v1/documents — dedicated update endpoint for Edit. */
export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDocumentRequestDto) => updateDocument(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}

/** POST /api/v1/document-categories — refreshes category options after create. */
export function useAddDocumentCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDocCategoryRequestDto) => addDocCategory(payload),
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: documentQueryKeys.categories,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

/** PUT /api/v1/document-versions/{docVersionId}/approval */
export function useApproveDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApproveDocumentRequestDto) =>
      approveDocument(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}

/** PUT /api/v1/document-versions/{versionId}/acknowledge */
export function useAcknowledgeDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcknowledgeDocumentRequestDto) =>
      acknowledgeDocument(payload),
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: documentQueryKeys.all,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}
