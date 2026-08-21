"use client";

import type { ReactNode } from "react";
import { useCapabilities } from "@/lib/capabilities";

export type CanProps = Readonly<{
  /** The capability required — `Incident.Close`. */
  do?: string;
  /** Require every one of these. */
  all?: readonly string[];
  /** Require at least one of these. */
  any?: readonly string[];
  children: ReactNode;
  /** What to render instead. Defaults to nothing, which is what a hidden control wants. */
  fallback?: ReactNode;
  /**
   * Render the children while the session is still loading, rather than the fallback.
   *
   * Off by default, because a control that appears and then vanishes is worse than one
   * that appears a moment late. Turn it on only where the fallback would be more jarring
   * than an optimistic render — a whole page section, say, rather than a button.
   */
  showWhilePending?: boolean;
}>;

/**
 * Renders its children only if the user holds the capability.
 *
 * ```tsx
 * <Can do="Incident.Close">
 *   <Button onClick={close}>Close incident</Button>
 * </Can>
 * ```
 *
 * This is the piece that made retiring the `button:` catalogue possible. Those 85 rows
 * were seeded, shown in the admin portal's role editor, saved against roles and shipped in
 * every token — and read by nothing. Worse, they carried no module: `button:save` was a
 * single row shared by every screen in the product, so unticking it would have stopped
 * saving everywhere at once. A control now names the same capability its endpoint does, so
 * what an admin ticks in Roles & Rights is what the user sees and what the API allows.
 *
 * **Hiding a control is not access control.** It removes a dead end from the interface;
 * the API refuses the call regardless. Never rely on this for anything the user must not
 * be able to do.
 */
export function Can(props: Readonly<CanProps>) {
  const {
    do: capability,
    all,
    any,
    children,
    fallback = null,
    showWhilePending = false,
  } = props;

  const { can, canAll, canAny, isReady } = useCapabilities();

  if (!isReady) {
    return showWhilePending ? <>{children}</> : <>{fallback}</>;
  }

  const checks: boolean[] = [];
  if (capability !== undefined) checks.push(can(capability));
  if (all !== undefined) checks.push(canAll(all));
  if (any !== undefined) checks.push(canAny(any));

  // No condition given is a caller mistake, and rendering the children would make it an
  // invisible one — a gate that silently permits everything. Refuse instead, so it shows
  // up the first time the component is looked at.
  if (checks.length === 0) return <>{fallback}</>;

  return checks.every(Boolean) ? <>{children}</> : <>{fallback}</>;
}
