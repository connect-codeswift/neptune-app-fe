"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthContext } from "@/lib/auth-context";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { sessionQueryKeys } from "@/hooks/use-session-bootstrap";
import { getOrgSession } from "@/services/session.service";

const SESSION_STALE_TIME_MS = 5 * 60 * 1000;

export type CurrentSite = Readonly<{
  /** `0` when the access token carries no site claim. */
  id: number;
  /** `null` while loading, and when the backend never named the site. */
  name: string | null;
  isLoading: boolean;
}>;

/**
 * The site the signed-in user is scoped to — the one the dashboard is showing.
 *
 * Same query key and stale time as `useSessionBootstrap`, so mounting this
 * alongside the sidebar costs nothing: React Query serves both from one
 * `/Auth/Org/me` response. This exists so a form that needs nothing but the
 * site doesn't have to pull in nav groups and permission merging to get it.
 *
 * The id comes from the JWT rather than the session payload — it is the claim
 * every site-scoped endpoint is authorised against, so reading it anywhere else
 * risks querying a site the token can't actually see. The name is the session's
 * (`siteName`, else the matching row in `sites`), falling back to the JWT's own
 * `siteName` claim when `/Auth/Org/me` is unavailable.
 */
export function useCurrentSite(): CurrentSite {
  const hasToken = useHasAccessToken();
  const auth = getAuthContext();

  const sessionQuery = useQuery({
    queryKey: sessionQueryKeys.me,
    queryFn: () => getOrgSession(),
    enabled: hasToken === true,
    staleTime: SESSION_STALE_TIME_MS,
    retry: 1,
  });

  const session = sessionQuery.data;
  const siteId = auth?.siteId ?? 0;

  const name =
    session?.siteName ??
    session?.sites.find((site) => site.id === (session.siteId ?? siteId))
      ?.siteName ??
    auth?.siteName ??
    null;

  return {
    id: siteId,
    name,
    isLoading:
      hasToken === null || (hasToken === true && sessionQuery.isLoading),
  };
}
