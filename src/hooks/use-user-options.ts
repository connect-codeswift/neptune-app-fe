"use client";

import { useEffect, useState } from "react";
import {
  fromDropdownItem,
  fromSiteUser,
  matchesQuery,
  type UserOption,
} from "@/components/inputs/user-option";
import type { UserPickerValue } from "@/components/inputs/UserPickerInput";
import {
  useSiteUsersQuery,
  useUserDropdownQuery,
} from "@/hooks/use-user-queries";

/** Long enough that a name typed at speed is one request, short enough to feel live. */
export const USER_SEARCH_DEBOUNCE_MS = 300;

export type UserOptionsSource = "site" | "org";

export type UseUserOptionsArgs = Readonly<{
  /**
   * `site` searches the roster on the backend, one request per debounced term.
   * `org` loads `/users/dropdown` once and filters in the browser.
   */
  source: UserOptionsSource;
  /** Roster to search when `source` is `site`. `0` = no site claim in the JWT. */
  siteId?: number;
  /** Raw query straight from the input — this hook owns the debounce. */
  query: string;
  /** Callers pass `open`: an unopened picker should not spend a request. */
  enabled: boolean;
  /** User ids to hide. */
  exclude?: readonly string[];
  /** Extra rule, e.g. LOTO's "registered and active only". */
  filter?: (user: UserOption) => boolean;
}>;

export type UseUserOptionsResult = Readonly<{
  users: readonly UserOption[];
  isLoading: boolean;
  isError: boolean;
  /** True while the list on screen may not match what has been typed. */
  isSearching: boolean;
  /** The term the current list actually answers. */
  debouncedQuery: string;
  /** Changes whenever a fresh result set arrives — used to expire a highlight. */
  resultsKey: string;
  /** True when `source` is `site` but the session carries no site. */
  hasNoSite: boolean;
}>;

/**
 * The people a picker may offer, from either source, already searched, excluded
 * and filtered.
 *
 * Exclusions and filters are applied **here**, before the array is returned,
 * because the keyboard highlight indexes into it: a row removed further
 * downstream would shift Enter onto the person below the one under the cursor.
 * That bug is easy to reintroduce and impossible to see in review, so the
 * narrowing lives in one place rather than in each picker.
 */
export function useUserOptions(args: UseUserOptionsArgs): UseUserOptionsResult {
  const { source, siteId = 0, query, enabled, exclude, filter } = args;

  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setDebouncedQuery(query);
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [query]);

  const isOrg = source === "org";

  const siteUsersQuery = useSiteUsersQuery(
    siteId,
    { search: debouncedQuery },
    enabled && !isOrg,
  );
  const orgUsersQuery = useUserDropdownQuery(enabled && isOrg);

  const active = isOrg ? orgUsersQuery : siteUsersQuery;

  const rawOptions: UserOption[] = isOrg
    ? (orgUsersQuery.data?.dataModel ?? [])
        .map(fromDropdownItem)
        .filter((user): user is UserOption => user !== null)
        .filter((user) => matchesQuery(user, debouncedQuery))
    : (siteUsersQuery.data ?? [])
        .map(fromSiteUser)
        .filter((user): user is UserOption => user !== null);

  const users = rawOptions.filter((user) => {
    if (exclude?.includes(user.id)) {
      return false;
    }

    return filter ? filter(user) : true;
  });

  return {
    users,
    isLoading: active.isLoading,
    isError: active.isError,
    isSearching: enabled && (active.isFetching || debouncedQuery !== query),
    debouncedQuery,
    resultsKey: `${debouncedQuery}:${String(active.dataUpdatedAt)}`,
    hasNoSite: !isOrg && siteId <= 0,
  };
}

/**
 * User ids → picker entries, with names filled in from the roster.
 *
 * A form opened for editing arrives with ids and no names: the payload had no
 * reason to carry them. Rather than making every such form fetch and index a
 * roster of its own — which is what four of them used to do — they hand their
 * ids here and get back what the picker wants. Nothing is fetched when every id
 * already has a name, so a freshly-picked selection costs no request.
 */
export function useResolvedUserValues(
  ids: readonly string[],
  args: Readonly<{
    source: UserOptionsSource;
    siteId?: number;
    /** Names already known, positionally matched to `ids`. */
    names?: readonly string[];
  }>,
): readonly UserPickerValue[] {
  const { source, siteId = 0, names = [] } = args;
  const unresolved = ids.filter((id, index) => !names[index]);

  const options = useUserOptions({
    source,
    siteId,
    query: "",
    enabled: unresolved.length > 0,
  });

  return ids.map((id, index) => ({
    userId: id,
    name:
      names[index] ||
      options.users.find((user) => user.id === id)?.name ||
      `User ${id}`,
  }));
}
