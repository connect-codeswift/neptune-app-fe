"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import { getCapasByIncidentId } from "@/services/capa.service";
import {
  EMPTY_LINKED_CAPA_VIEW,
  mapCapaDtosToLinkedView,
} from "@/services/mappers/capa.mapper";

export const capaQueryKeys = {
  all: ["capas"] as const,
  byIncident: (incidentId: number) =>
    [...capaQueryKeys.all, "incident", incidentId] as const,
};

export type UseCapasByIncidentQueryOptions = Readonly<{
  incidentId: number | null;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads CAPAs for an incident via GET /api/CAPA/Incident/{incidentId}.
 */
export function useCapasByIncidentQuery(
  options: UseCapasByIncidentQueryOptions,
) {
  const incidentId = options.incidentId;
  const enabled =
    (options.enabled ?? false) && incidentId != null && incidentId > 0;

  const auth = enabled ? getAuthContext() : null;

  return useQuery({
    queryKey: capaQueryKeys.byIncident(incidentId ?? 0),
    enabled,
    queryFn: async () => {
      if (incidentId == null || incidentId <= 0) {
        return EMPTY_LINKED_CAPA_VIEW;
      }

      const dtos = await getCapasByIncidentId(incidentId);
      return mapCapaDtosToLinkedView(dtos, {
        currentUserId: auth?.userId,
      });
    },
  });
}
