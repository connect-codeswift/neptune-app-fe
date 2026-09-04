"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { findNavItemForPath, passesRoleGate } from "@/lib/app-nav";
import { useCapabilities } from "@/lib/capabilities";
import { NoAccessPanel } from "./NoAccessPanel";

export type RequireCapabilityProps = Readonly<{
  children: ReactNode;
  /**
   * Override the capability. Omit it and the requirement is read from the nav entry the
   * current route belongs to, which is the same entry that decides whether the module
   * appears in the sidebar — so a route and its menu item cannot disagree about who may
   * reach it.
   */
  capability?: string;
  /** Rendered while the session loads. Defaults to nothing. */
  pending?: ReactNode;
}>;

/**
 * Refuses a route to anyone without the capability behind it.
 *
 * ## Why this exists
 *
 * `app-nav.ts` has carried the comment "hiding a nav item is not access control; the route
 * still has to refuse anyone who types the URL" for as long as the nav filter has existed,
 * and until now nothing did that. There is no middleware in this app — tokens live in
 * `localStorage`, not cookies, so a server-side check has nothing to read — which left
 * typing a URL as a way to render any page in the product. Every API call on it failed,
 * so no data leaked, but the page rendered: charts with empty states, forms that 403 on
 * submit, and no explanation.
 *
 * Wrapping a route group's layout closes that. It is a client-side check on client-held
 * state and it is not a security boundary; the API is. What it buys is an honest answer
 * instead of a broken screen.
 *
 * ## Where to use it
 *
 * On the layout of a route group, not on individual pages — one wrap covers every route
 * beneath it, including ones added later, and a page added to a guarded group is guarded
 * by default rather than by someone remembering.
 */
export function RequireCapability(props: Readonly<RequireCapabilityProps>) {
  const { children, capability, pending = null } = props;

  const pathname = usePathname();
  const { can, hasModule, role, isReady } = useCapabilities();

  const navItem = findNavItemForPath(pathname ?? "");
  const required = capability ?? navItem?.capability;

  // Waiting is not refusing. Showing the refusal first and the page a moment later is how
  // a correctly-permitted user gets told they have no access on every hard refresh.
  if (!isReady) return <>{pending}</>;

  // The licence is checked first so the message can say the true reason. "Your company has
  // not enabled this" is a different problem from "your role cannot see this", and sending
  // someone to their administrator to fix the wrong one wastes everybody's time.
  if (navItem?.moduleCode && !hasModule(navItem.moduleCode)) {
    return (
      <NoAccessPanel
        reason="module"
        title={`${navItem.label} is not enabled`}
        description="This module is not part of your company's plan. Your CodeSwift administrator can turn it on."
      />
    );
  }

  // The role gate runs before the capability check and before the "nothing behind it"
  // shortcut, for the same reason the sidebar filter puts it first: an allowedRoles list is
  // a restriction, and a held capability must not be able to widen it. Policy Maker is the
  // live case — Worker holds Document.View so the capability alone would let them type the
  // URL into the document library.
  if (navItem && !passesRoleGate(navItem, role)) {
    return (
      <NoAccessPanel
        reason="permission"
        title={`You do not have access to ${navItem.label}`}
        description="Your role does not include this. An administrator can grant it in Roles & Rights."
      />
    );
  }

  // A route with nothing behind it is open by construction: Chat, Dashboard, Settings and
  // the profile pages have no module and no capability, and every user needs them.
  if (!required) return <>{children}</>;

  if (!can(required)) {
    return (
      <NoAccessPanel
        reason="permission"
        title={`You do not have access to ${navItem?.label ?? "this page"}`}
        description="Your role does not include this. An administrator can grant it in Roles & Rights."
      />
    );
  }

  return <>{children}</>;
}
