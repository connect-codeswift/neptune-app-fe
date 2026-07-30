"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAllDocCategories,
  getAllDocDepartments,
  getAllDocuments,
} from "@/services/document.service";
import { mapDocumentDtosToPolicyDocuments } from "@/services/mappers/document-list.mapper";

export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (params: { pageNumber: number; pageSize: number }) =>
    [...documentQueryKeys.all, "list", params] as const,
  categories: ["documents", "categories"] as const,
  departments: ["documents", "departments"] as const,
};

export const DEFAULT_DOCUMENTS_PAGE_NUMBER = 1;
export const DEFAULT_DOCUMENTS_PAGE_SIZE = 10;

export type UseDocumentsListQueryOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads documents via POST /api/Document/allDocuments
 * body: `{ pageNumber, pageSize }`
 */
export function useDocumentsListQuery(
  options: UseDocumentsListQueryOptions = {},
) {
  const pageNumber = options.pageNumber ?? DEFAULT_DOCUMENTS_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_DOCUMENTS_PAGE_SIZE;
  const enabled = options.enabled ?? false;

  return useQuery({
    queryKey: documentQueryKeys.list({ pageNumber, pageSize }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getAllDocuments({ pageNumber, pageSize });
      return {
        ...response,
        records: mapDocumentDtosToPolicyDocuments(response.items),
      };
    },
  });
}

/** GET /api/Document/GetAllCategories */
export function useDocumentCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.categories,
    queryFn: () => getAllDocCategories(),
    enabled,
  });
}

/** GET /api/Document/GetAllDepartments */
export function useDocumentDepartmentsQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.departments,
    queryFn: () => getAllDocDepartments(),
    enabled,
  });
}
