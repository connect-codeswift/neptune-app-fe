import { useQuery } from "@tanstack/react-query";
import {
  getUserById,
  getUserDropdown,
  getUsersBySiteId,
  type SiteUsersParams,
} from "@/services/user.service";

export function useUserDropdownQuery(enabled = true) {
  return useQuery({
    queryKey: ["user", "dropdown"] as const,
    queryFn: () => getUserDropdown(),
    enabled,
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
 * Cache key for one user's gender.
 *
 * Exported as a key rather than wrapped in a `useQuery` hook because the only
 * caller fetches imperatively — the lookup answers a single deliberate action
 * (picking the affected person), not a state the screen has to stay in sync
 * with. Sharing the key still means picking the same colleague twice costs one
 * request, and pairs with `staleTime: Infinity` at the call site: a person's
 * gender does not change while a form is open.
 */
export function userGenderQueryKey(userId: number) {
  return ["user", "gender", userId] as const;
}

/**
 * The signed-in user's own record, for the fields the session bootstrap does not carry.
 *
 * `GET /organizations/me` is org-scoped — it brings the job title along because the sidebar
 * needs it on first paint, but not the phone number. The profile form needs the stored phone to
 * seed its field, and seeding it from anything else would show the user a number that is not
 * theirs and write it back on save.
 */
export const myProfileQueryKey = ["user", "me"] as const;

export function useMyProfileQuery(userId: number, enabled = true) {
  return useQuery({
    queryKey: [...myProfileQueryKey, userId] as const,
    queryFn: () => getUserById(userId),
    enabled: enabled && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
