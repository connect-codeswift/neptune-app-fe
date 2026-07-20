"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import { getAllIncidents } from "@/services/incident.service";
import { mapIncidentDtosToListRecords } from "@/services/mappers/incident-list.mapper";

export const incidentQueryKeys = {
  all: ["incidents"] as const,
  list: (params: {
    pageNumber: number;
    pageSize: number;
    userId: number;
    subCompanyId: number;
  }) => [...incidentQueryKeys.all, "list", params] as const,
};

export type UseIncidentsListQueryOptions = Readonly<{
  /** Defaults to `0` to match Swagger GetAllIncidents example. */
  pageNumber?: number;
  /** Defaults to `0` to match Swagger GetAllIncidents example. */
  pageSize?: number;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads incidents via POST /api/Incident/GetAllIncidents
 * body: `{ pageNumber, pageSize, subCompanyId, userId }`
 */
export function useIncidentsListQuery(
  options: UseIncidentsListQueryOptions = {},
) {
  const pageNumber = options.pageNumber ?? 0;
  const pageSize = options.pageSize ?? 0;
  const enabled = options.enabled ?? false;

  // Only read JWT/localStorage when the query is allowed to run (post-hydration).
  const auth = enabled ? getAuthContext() : null;
  const userId = auth?.userId ?? 0;
  const subCompanyId = auth?.subCompanyId ?? 0;

  return useQuery({
    queryKey: incidentQueryKeys.list({
      pageNumber,
      pageSize,
      userId,
      subCompanyId,
    }),
    enabled,
    queryFn: async () => {
      const response = await getAllIncidents({
        pageNumber,
        pageSize,
        userId,
        subCompanyId,
      });

      return {
        ...response,
        records: mapIncidentDtosToListRecords(response.items),
      };
    },
  });
}
