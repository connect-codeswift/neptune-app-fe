"use client";

import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/services/location.service";

export const locationQueryKeys = {
  all: ["locations"] as const,
  list: (search?: string) =>
    [...locationQueryKeys.all, "list", search ?? ""] as const,
};

/** GET /api/v1/locations — the whole register, never paginated. */
export function useLocationsQuery(enabled = true, search?: string) {
  return useQuery({
    queryKey: locationQueryKeys.list(search),
    queryFn: () => getLocations(search),
    enabled,
  });
}
