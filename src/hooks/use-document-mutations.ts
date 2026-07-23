"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AddDocCategoryRequestDto,
  AddDocDepartmentRequestDto,
  CreateDocumentRequestDto,
} from "@/dtos/req/document-request.dto";
import { documentQueryKeys } from "@/hooks/use-document-queries";
import {
  addDocCategory,
  addDocDepartment,
  createDocument,
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
