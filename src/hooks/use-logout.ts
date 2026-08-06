"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { clearAuthTokens } from "@/lib/axios";
import { safeAppNavigate } from "@/lib/safe-app-navigation";
import { logout } from "@/services/auth.service";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Clear the local session even when the API call fails.
    } finally {
      clearAuthTokens();
      queryClient.clear();
      safeAppNavigate(router, "/login", { replace: true });
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, queryClient, router]);

  return { signOut, isLoggingOut };
}
