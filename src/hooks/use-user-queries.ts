import { useQuery } from "@tanstack/react-query";
import {
  getUserDropdown,
  getUserGenderById,
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

/**
 * One user's gender, for filling the incident form's Gender from the affected
 * person's own record.
 *
 * A person's gender does not change between page loads, so this is cached for
 * the session — picking the same colleague twice costs one request, not two.
 */
export function useUserGenderQuery(userId: number, enabled = true) {
  return useQuery({
    queryKey: ["user", "gender", userId] as const,
    queryFn: () => getUserGenderById(userId),
    enabled: enabled && userId > 0,
    staleTime: Infinity,
  });
}
