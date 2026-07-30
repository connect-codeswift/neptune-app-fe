"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAllDocCategories,
  getAllDocDepartments,
  getAllDocuments,
  getDocumentById,
  getDocumentCategoryStats,
  getDocumentDashboardKpis,
} from "@/services/document.service";
import {
  mapDocumentDtosToPolicyDocuments,
  mapDocumentDtoToPolicyDocument,
} from "@/services/mappers/document-list.mapper";

export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (params: { pageNumber: number; pageSize: number }) =>
    [...documentQueryKeys.all, "list", params] as const,
  detail: (id: number) => [...documentQueryKeys.all, "detail", id] as const,
  categories: ["documents", "categories"] as const,
  departments: ["documents", "departments"] as const,
  dashboardKpis: ["documents", "dashboard-kpis"] as const,
  categoryStats: ["documents", "category-stats"] as const,
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

export type UseDocumentByIdQueryOptions = Readonly<{
  id: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
  /** Resolves `departmentId` to a name — the detail endpoint has no name field. */
  departmentNameById?: ReadonlyMap<string, string>;
}>;

/**
 * Loads a single document via GET /api/Document/{id}.
 * Returns `null` (not an error) when the backend has nothing for that id.
 */
export function useDocumentByIdQuery(options: UseDocumentByIdQueryOptions) {
  const { id, departmentNameById } = options;
  const enabled = (options.enabled ?? false) && id != null && id > 0;

  return useQuery({
    queryKey: documentQueryKeys.detail(id ?? 0),
    enabled,
    queryFn: async () => {
      if (id == null) {
        return null;
      }
      return getDocumentById(id);
    },
    select: (dto) =>
      dto ? mapDocumentDtoToPolicyDocument(dto, { departmentNameById }) : null,
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

/** GET /api/Document/dashboard-kpis */
export function useDocumentDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.dashboardKpis,
    queryFn: () => getDocumentDashboardKpis(),
    enabled,
  });
}

/** GET /api/Document/category-stats */
export function useDocumentCategoryStatsQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.categoryStats,
    queryFn: () => getDocumentCategoryStats(),
    enabled,
  });
}
