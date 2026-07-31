"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AcknowledgeDocumentRequestDto,
  AddDocCategoryRequestDto,
  AddDocDepartmentRequestDto,
  ApproveDocumentRequestDto,
  CreateDocumentRequestDto,
  CreateDocumentVersionRequestDto,
  UpdateDocumentRequestDto,
} from "@/dtos/req/document-request.dto";
import { documentQueryKeys } from "@/hooks/use-document-queries";
import {
  acknowledgeDocument,
  addDocCategory,
  addDocDepartment,
  approveDocument,
  createDocument,
  createDocumentVersion,
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

/** PUT /api/Document/document — dedicated update endpoint for Edit. */
export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDocumentRequestDto) => updateDocument(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}

/** POST /api/Document/document_version — attaches a new PDF revision. */
export function useCreateDocumentVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentVersionRequestDto) =>
      createDocumentVersion(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}

/** POST /api/Document/AddCategory — refreshes category options after create. */
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

/** POST /api/Document/AddDepartment — refreshes department options after create. */
export function useAddDocumentDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDocDepartmentRequestDto) =>
      addDocDepartment(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentQueryKeys.departments,
      });
    },
  });
}

/** PUT /api/Document/DocApproval */
export function useApproveDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApproveDocumentRequestDto) => approveDocument(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
}

/** PUT /api/Document/Acknowledgement */
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
