"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAllDocCategories,
  getAllDocDepartments,
  getAllDocuments,
  getDocumentAcknowledgements,
  getDocumentById,
  getDocumentDashboardKpis,
  getDocumentVersions,
} from "@/services/document.service";
import { mapAcknowledgementsDto } from "@/services/mappers/acknowledgement.mapper";
import {
  mapDocumentDtosToPolicyDocuments,
  mapDocumentDtoToPolicyDocument,
  mapVersionDto,
} from "@/services/mappers/document-list.mapper";

export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (params: { pageNumber: number; pageSize: number }) =>
    [...documentQueryKeys.all, "list", params] as const,
  detail: (id: number) => [...documentQueryKeys.all, "detail", id] as const,
  versions: (documentId: number) =>
    [...documentQueryKeys.all, "versions", documentId] as const,
  acknowledgements: (documentVersionId: number) =>
    [...documentQueryKeys.all, "acknowledgements", documentVersionId] as const,
  categories: ["documents", "categories"] as const,
  departments: ["documents", "departments"] as const,
  dashboardKpis: ["documents", "dashboard-kpis"] as const,
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
 * Loads documents via POST /api/v1/documents/search
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
 * Loads a single document via GET /api/v1/documents/{id}.
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

export type UseDocumentVersionsQueryOptions = Readonly<{
  documentId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads a document's version history via GET /api/v1/documents/{documentId}/versions.
 */
export function useDocumentVersionsQuery(
  options: UseDocumentVersionsQueryOptions,
) {
  const { documentId } = options;
  const enabled =
    (options.enabled ?? false) && documentId != null && documentId > 0;

  return useQuery({
    queryKey: documentQueryKeys.versions(documentId ?? 0),
    enabled,
    queryFn: async () => {
      if (documentId == null) {
        return [];
      }
      return getDocumentVersions(documentId);
    },
    select: (dtos) => dtos.map(mapVersionDto),
  });
}

export type UseDocumentAcknowledgementsQueryOptions = Readonly<{
  documentVersionId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads acknowledgement roster for a document version via
 * GET /api/v1/document-versions/{documentVersionId}/acknowledgements.
 */
export function useDocumentAcknowledgementsQuery(
  options: UseDocumentAcknowledgementsQueryOptions,
) {
  const { documentVersionId } = options;
  const enabled =
    (options.enabled ?? false) &&
    documentVersionId != null &&
    documentVersionId > 0;

  return useQuery({
    queryKey: documentQueryKeys.acknowledgements(documentVersionId ?? 0),
    enabled,
    queryFn: async () => {
      if (documentVersionId == null) {
        return {
          records: [],
          acknowledgedCount: 0,
          pendingCount: 0,
          completionRate: 0,
        };
      }
      const response = await getDocumentAcknowledgements(documentVersionId);
      return mapAcknowledgementsDto(response.dataModel);
    },
  });
}

/** GET /api/v1/document-categories */
export function useDocumentCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.categories,
    queryFn: () => getAllDocCategories(),
    enabled,
  });
}

/** GET /api/v1/departments */
export function useDocumentDepartmentsQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.departments,
    queryFn: () => getAllDocDepartments(),
    enabled,
  });
}

/** GET /api/v1/documents/dashboard-kpis */
export function useDocumentDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: documentQueryKeys.dashboardKpis,
    queryFn: () => getDocumentDashboardKpis(),
    enabled,
  });
}

/** GET /api/v1/documents/category-stats */
