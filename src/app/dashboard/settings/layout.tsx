"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { isAdminRole } from "@/lib/jwt-permissions";

/**
 * Settings is company-wide configuration, so it belongs to the owner rather than to whoever
 * is signed in. Hiding it from the sidebar is presentation only — this stops the route being
 * reached by typing the URL, and covers every page nested under it rather than each one
 * remembering to check.
 *
 * Not a security boundary: the JWT is decoded client-side and the answer could be forced by
 * anyone determined enough. The endpoints behind these screens are gated on the server, which
 * is what actually refuses them. This exists so the app does not offer a screen that will
 * then fail.
 */
export default function SettingsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const { user, isUserReady } = useSessionBootstrap();

  // user.role falls back to the string "User" when the session has none, which isAdminRole
  // correctly rejects.
  const allowed = isAdminRole(user.role);

  useEffect(() => {
    // Wait for the session before deciding — redirecting on a not-yet-loaded role would
    // bounce the owner out of their own settings on every refresh.
    if (isUserReady && !allowed) {
      router.replace("/dashboard");
    }
  }, [isUserReady, allowed, router]);

  if (!isUserReady) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
