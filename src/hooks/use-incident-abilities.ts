"use client";

import { useCapabilities } from "@/lib/capabilities";

export type IncidentAbilities = {
  /** May edit the incident's own fields — `PUT /incident/{id}`. */
  canEdit: boolean;
  /** May drive the closure wizard — the three `/{id}/closure*` endpoints. */
  canClose: boolean;
  /**
   * May read the investigation. A separate module: the RCA endpoints gate on `Rca.View`,
   * not on `Incident.View`, so holding the incident read is not enough and the tab 403s.
   */
  canViewRca: boolean;
};

/**
 * What the signed-in user may do to an incident.
 *
 * One place naming the two capabilities, because the alternative is the string
 * `"Incident.Close"` written into whichever component happens to need it — which is how
 * the Add CAPA button ended up gated on six screens and ungated on a seventh.
 *
 * **Permission over role.** The closure endpoints also carry
 * `[AuthorizeRoles(Ehs_Lead, Ehs_Manager, Ehs_Director)]`, but `PermissionSatisfiesRoleHandler`
 * lets the permission satisfy that list, so a Supervisor granted `Incident.Close` in Roles &
 * Rights really can close and must see the wizard. Gating on the role name here would hide a
 * control the API would have allowed, and silently override the admin's decision.
 *
 * Record state is deliberately not folded in. A closed incident is already read-only in the
 * view, and that rule is tangled with which tab is open — knowledge a permissions hook has no
 * business holding.
 */
export function useIncidentAbilities(): IncidentAbilities {
  const { can } = useCapabilities();

  return {
    canEdit: can("Incident.Update"),
    canClose: can("Incident.Close"),
    canViewRca: can("Rca.View"),
  };
}
