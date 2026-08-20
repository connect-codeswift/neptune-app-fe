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
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
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
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.categories,
      });
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
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}
