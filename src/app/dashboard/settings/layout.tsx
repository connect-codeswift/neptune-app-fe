"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  DEFAULT_SETTINGS_HREF,
  isSettingsSectionActive,
  SETTINGS_SECTIONS,
} from "@/components/settings/settings-nav";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { isAdminRole } from "@/lib/jwt-permissions";

/**
 * Gates the **company-wide** sections of Settings, not the whole route.
 *
 * This layout used to redirect any non-admin away from `/dashboard/settings` outright, which
 * was right when the only thing here was incident-rate configuration. Personal settings —
 * profile, security, appearance — now live on the same page, and those belong to whoever is
 * signed in: gating them would lock every ordinary user out of their own password and theme.
 * So the check moved from the route to the section.
 *
 * Not a security boundary: the JWT is decoded client-side and the answer could be forced by
 * anyone determined enough. The endpoints behind the admin screens are gated on the server,
 * which is what actually refuses them. This exists so the app does not offer a screen that will
 * then fail.
 */
export default function SettingsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserReady } = useSessionBootstrap();

  // user.role falls back to the string "User" when the session has none, which isAdminRole
  // correctly rejects.
  const isAdmin = isAdminRole(user.role);

  const activeSection = SETTINGS_SECTIONS.find((section) =>
    isSettingsSectionActive(pathname, section.href),
  );
  const isBlocked = Boolean(activeSection?.adminOnly) && !isAdmin;

  useEffect(() => {
    // Wait for the session before deciding — redirecting on a not-yet-loaded role would
    // bounce the owner out of their own settings on every refresh.
    if (isUserReady && isBlocked) {
      // Into the personal tabs rather than out to the dashboard: the user does have settings,
      // just not this one.
      router.replace(DEFAULT_SETTINGS_HREF);
    }
  }, [isUserReady, isBlocked, router]);

  if (!isUserReady || isBlocked) {
    return null;
  }

  return <>{children}</>;
}
