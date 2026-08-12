"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import {
  getAllIncidents,
  getIncidentById,
  getIncidentClosure,
} from "@/services/incident.service";
import { mapIncidentDtoToDetailView } from "@/services/mappers/incident-detail.mapper";
import { mapIncidentDtosToListRecords } from "@/services/mappers/incident-list.mapper";

export const incidentQueryKeys = {
  all: ["incidents"] as const,
  list: (params: {
    pageNumber: number;
    pageSize: number;
    /** Server-side filters — part of the key so each filter set caches apart. */
    search: string;
    severity: string;
  }) => [...incidentQueryKeys.all, "list", params] as const,
  detail: (params: { id: number; userId: number; siteId: number }) =>
    [...incidentQueryKeys.all, "detail", "v7", params] as const,
  closure: (id: number) => [...incidentQueryKeys.all, "closure", id] as const,
};

/**
 * Backend paging notes (from staging API behavior):
 * - `pageNumber` is 1-based. `0` becomes a negative SQL OFFSET.
 * - `pageSize: 0` returns `data: []` even when `totalRecords` > 0.
 */
export const DEFAULT_INCIDENTS_PAGE_NUMBER = 1;
export const DEFAULT_INCIDENTS_PAGE_SIZE = 10;

export type UseIncidentsListQueryOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  /** Substring match on description / location, applied server-side. */
  search?: string;
  /** Severity filter, applied server-side. */
  severity?: string;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads incidents via POST /api/Incident/GetAllIncidents
 * body: `{ pageNumber, pageSize, search?, severity?, site? }`
 * Tenant scope is resolved from the JWT — not sent in the body.
 */
export function useIncidentsListQuery(
  options: UseIncidentsListQueryOptions = {},
) {
  const pageNumber = options.pageNumber ?? DEFAULT_INCIDENTS_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_INCIDENTS_PAGE_SIZE;
  const enabled = options.enabled ?? false;
  const search = options.search?.trim() ?? "";
  const severity = options.severity?.trim() ?? "";

  return useQuery({
    queryKey: incidentQueryKeys.list({
      pageNumber,
      pageSize,
      search,
      severity,
    }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getAllIncidents({
        pageNumber,
        pageSize,
        ...(search ? { search } : {}),
        ...(severity ? { severity } : {}),
      });

      return {
        ...response,
        records: mapIncidentDtosToListRecords(response.items),
      };
    },
  });
}

export type UseIncidentByIdQueryOptions = Readonly<{
  id: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
  /** Refetch on every mount — use for list preview panel so state stays in sync. */
  alwaysFresh?: boolean;
}>;

/**
 * Loads a single incident via GET /api/Incident/GetIncidentById
 * query: `{ id, userId, siteId }`
 * header: `Authorization: Bearer <token>` (required)
 */
export function useIncidentByIdQuery(options: UseIncidentByIdQueryOptions) {
  const id = options.id;
  const enabled = (options.enabled ?? false) && id != null && id > 0;
  const alwaysFresh = options.alwaysFresh ?? false;

  const auth = enabled ? getAuthContext() : null;
  const userId = auth?.userId ?? 0;
  const siteId = auth?.siteId ?? 0;

  return useQuery({
    queryKey: incidentQueryKeys.detail({
      id: id ?? 0,
      userId,
      siteId,
    }),
    enabled,
    staleTime: alwaysFresh ? 0 : undefined,
    refetchOnMount: alwaysFresh ? "always" : undefined,
    queryFn: async () => {
      if (id == null || id <= 0) {
        return null;
      }

      if (!auth) {
        throw new Error("Sign in required to load this incident.");
      }

      const dto = await getIncidentById({
        id,
        userId: auth.userId,
        siteId: auth.siteId,
      });

      if (!dto) {
        return null;
      }

      return {
        dto,
        detail: mapIncidentDtoToDetailView(dto, {
          uploadedBy: getAuthDisplayName(),
        }),
      };
    },
  });
}

export type UseIncidentClosureQueryOptions = Readonly<{
  incidentId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads incident closure data via GET /api/Incident/{incidentId}/closure
 * header: `Authorization: Bearer <token>` (required)
 */
export function useIncidentClosureQuery(
  options: UseIncidentClosureQueryOptions,
) {
  const incidentId = options.incidentId;
  const enabled =
    (options.enabled ?? false) && incidentId != null && incidentId > 0;

  return useQuery({
    queryKey: incidentQueryKeys.closure(incidentId ?? 0),
    enabled,
    queryFn: async () => {
      if (incidentId == null || incidentId <= 0) {
        return null;
      }
      return getIncidentClosure(incidentId);
    },
  });
}
