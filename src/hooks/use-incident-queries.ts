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
  // v8: tenant ids left the key along with the request params. They were only
  // ever there because they were sent — the JWT decides scope now, and a
  // token swap replaces the cache wholesale.
  detail: (id: number) =>
    [...incidentQueryKeys.all, "detail", "v8", id] as const,
  closure: (id: number) => [...incidentQueryKeys.all, "closure", id] as const,
};

/**
 * Terminal statuses on the incident endpoints, none of which a second attempt
 * changes: 404 the record is gone or belongs to another tenant, 400 the token
 * carries no site claim, 403 the token's claims are stale until re-login.
 */
function shouldRetryIncidentRequest(
  failureCount: number,
  error: unknown,
): boolean {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : undefined;

  if (status === 400 || status === 403 || status === 404) {
    return false;
  }

  return failureCount < 1;
}

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
 * Loads incidents via POST /api/v1/incidents/search
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
 * Loads a single incident via GET /api/v1/incidents/{id}
 * query: `{ id }` — tenant scope comes from the JWT
 * header: `Authorization: Bearer <token>` (required)
 *
 * Requires Incident.View, not Incident.Update — view-only users can open
 * detail.
 */
export function useIncidentByIdQuery(options: UseIncidentByIdQueryOptions) {
  const id = options.id;
  const enabled = (options.enabled ?? false) && id != null && id > 0;
  const alwaysFresh = options.alwaysFresh ?? false;

  return useQuery({
    queryKey: incidentQueryKeys.detail(id ?? 0),
    enabled,
    staleTime: alwaysFresh ? 0 : undefined,
    refetchOnMount: alwaysFresh ? "always" : undefined,
    // A dropped incident, another tenant's id, or a missing site claim are all
    // settled answers — retrying just fires a second request for the same
    // "not found". 404 is new here; it used to arrive as a 400.
    retry: shouldRetryIncidentRequest,
    queryFn: async () => {
      if (id == null || id <= 0) {
        return null;
      }

      if (!getAuthContext()) {
        throw new Error("Sign in required to load this incident.");
      }

      const dto = await getIncidentById({ id });

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
 * Loads incident closure data via GET /api/v1/incidents/{incidentId}/closure
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
    retry: shouldRetryIncidentRequest,
    queryFn: async () => {
      if (incidentId == null || incidentId <= 0) {
        return null;
      }
      return getIncidentClosure(incidentId);
    },
  });
}
