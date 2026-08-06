import { useQuery } from "@tanstack/react-query";
import {
  getUserDropdown,
  getUsersBySiteId,
  type SiteUsersParams,
} from "@/services/user.service";

export function useUserDropdownQuery() {
  return useQuery({
    queryKey: ["user", "dropdown"] as const,
    queryFn: () => getUserDropdown(),
  });
}

const SITE_USERS_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * People belonging to one site. `search` is passed straight to the backend, so
 * each distinct term is its own cache entry — debounce the term before it gets
 * here or every keystroke becomes a request.
 *
 * Disabled for `siteId <= 0`: that is the "no site claim in the JWT" case, and
 * the endpoint would answer it with an empty roster that looks like a real one.
 */
export function useSiteUsersQuery(
  siteId: number,
  params: SiteUsersParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ["user", "by-site", siteId, params] as const,
    queryFn: () => getUsersBySiteId(siteId, params),
    enabled: enabled && siteId > 0,
    staleTime: SITE_USERS_STALE_TIME_MS,
  });
}
