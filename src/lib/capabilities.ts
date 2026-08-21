"use client";

import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import type { EhsModuleCode } from "@/lib/ehs-modules";

/**
 * What the signed-in user may do, in the one vocabulary the whole platform now uses.
 *
 * A capability is a `Module.Action` string — `Incident.Create`, `Loto.Apply` — and it is
 * the same string three places already agree on: the `[HasPermission]` attribute on the
 * endpoint, the `Permission` claim in the token, and the checkbox in the admin portal's
 * Roles & Rights grid. Nothing derives it, translates it, or keeps a parallel list of it.
 *
 * This replaced two separate schemes. Routes were gated on `page:` strings generated from
 * route slugs, and controls were nominally gated on `button:` strings that no code ever
 * read — 85 of them, including `button:save`, which was one row shared by every module in
 * the product. Both said the same thing the capability already said.
 */
export type Capabilities = {
  /** Does the user hold this capability? */
  can: (capability: string | undefined) => boolean;
  /** Do they hold every one of these? */
  canAll: (capabilities: readonly string[]) => boolean;
  /** Do they hold at least one? */
  canAny: (capabilities: readonly string[]) => boolean;
  /** Has the company licensed this module? */
  hasModule: (code: EhsModuleCode | string | undefined) => boolean;
  /**
   * False while the session is still loading.
   *
   * Callers must not treat "not ready" as "denied" in a way the user can see: rendering a
   * page's empty state, or flashing a permission error, before the answer has arrived is
   * how a correctly-permitted user gets told they have no access for half a second. Show a
   * loading state instead.
   */
  isReady: boolean;
};

/**
 * The user's capability set.
 *
 * Backed by `useSessionBootstrap`, which merges the token's claims with the `permissions`
 * array on `GET /organizations/me`. Both are produced by the same backend rule, so they
 * agree on content; they differ in freshness, and that is the point of using both. Claims
 * are frozen when the token is minted, so a role edited in the admin portal does not reach
 * a signed-in user until their next token refresh. The org/me payload is re-fetched on a
 * five minute stale time, so the interface corrects itself without anyone logging out.
 *
 * The API still enforces the claims. This decides what to draw, not what is allowed.
 */
export function useCapabilities(): Capabilities {
  const { permissions, activatedModules, isUserReady } = useSessionBootstrap();

  const can = (capability: string | undefined) =>
    capability !== undefined && permissions.has(capability);

  return {
    can,
    canAll: (capabilities) => capabilities.every((entry) => can(entry)),
    canAny: (capabilities) => capabilities.some((entry) => can(entry)),
    hasModule: (code) =>
      code !== undefined && activatedModules.has(code.toUpperCase()),
    isReady: isUserReady,
  };
}
