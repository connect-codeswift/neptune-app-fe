"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { clearAuthTokens } from "@/lib/axios";
import { setCachedAccessWindow } from "@/lib/access-window";
import { logout } from "@/services/auth.service";

export function useLogout() {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    // Set before awaiting, so callers can show a wait state for the whole
    // round trip instead of only after it returns.
    setIsLoggingOut(true);

    try {
      // Has to run before the tokens are cleared — it needs them to
      // authenticate.
      await logout();
    } catch {
      // Clear the local session even when the API call fails.
    } finally {
      clearAuthTokens();
      setCachedAccessWindow(null);
      queryClient.clear();

      // A full document navigation, not router.replace.
      //
      // The previous soft navigation left this React tree mounted while
      // queryClient.clear() had already emptied the session, so the sidebar
      // re-rendered from no permissions and visibly collapsed to a couple of
      // nav items before the route finally changed. A hard navigation tears
      // the document down instead, so there is no intermediate render to see —
      // and it guarantees no stale state survives a sign-out, which is the
      // behaviour you want from this particular action anyway.
      globalThis.location.replace("/login");

      // Deliberately not reset: the document is on its way out, and flipping
      // this back to false would drop the wait state and re-expose the
      // half-cleared sidebar for the remainder of the unload.
    }
  }, [isLoggingOut, queryClient]);

  return { signOut, isLoggingOut };
}
