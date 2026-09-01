export type LotoHazardLevel = "Low" | "Medium" | "High" | "";

export type LotoIsolationStep = Readonly<{
  id: string;
  description: string;
  isolationPoint: string;
  energyType: string;
  isolationMethod: string;
  lockTagPosition: string;
  verified: boolean;
}>;

/** A site location picked from GET /api/v1/locations. */
export type LotoLocationSelection = Readonly<{
  id: number;
  name: string;
}>;

/** A site user picked via GET /api/v1/sites/{siteId}/users?search=. */
export type LotoPersonnelSelection = Readonly<{
  userId: number;
  name: string;
}>;

export type LotoProcedureFormState = {
  equipmentName: string;
  location: LotoLocationSelection | null;
  hazardLevel: LotoHazardLevel;
  description: string;
  steps: LotoIsolationStep[];
  verificationMethod: string;
  additionalNotes: string;
  selectedPpe: string[];
  selectedPersonnel: LotoPersonnelSelection[];
};

export const LOTO_ROUTE = "/dashboard/lockout-tagout";
export const LOTO_PROCEDURE_CREATE_ROUTE = `${LOTO_ROUTE}/procedure/create`;

export function lotoProcedureEditRoute(equipmentId: number): string {
  return `${LOTO_ROUTE}/procedure/${String(equipmentId)}/edit`;
}

export const LOTO_HAZARD_LEVELS = ["Low", "Medium", "High"] as const;

export const LOTO_ENERGY_TYPES = [
  "Electrical",
  "Hydraulic",
  "Pneumatic",
  "Mechanical",
  "Chemical",
  "Thermal",
  "Stored Pressure",
  "Other",
] as const;

/**
 * How an isolation point is secured. A starting set, not a closed one — the
 * field lets an author add their own, because the methods a site uses vary
 * with its equipment.
 *
 * "Notify Only" and "Verify Zero Energy" were dropped. Neither isolates
 * anything: telling someone is not a means of isolation, and verifying zero
 * energy is the check performed *after* isolating, which the Verification
 * Method field already records.
 */
export const LOTO_ISOLATION_METHODS = [
  "Lockout",
  "Tagout",
  "Lockout / Tagout",
  "Disconnect",
  "Block / Bleed",
] as const;

export function createEmptyIsolationStep(
  overrides: Partial<LotoIsolationStep> = {},
): LotoIsolationStep {
  return {
    id: crypto.randomUUID(),
    description: "",
    isolationPoint: "",
    energyType: "",
    isolationMethod: "",
    lockTagPosition: "",
    verified: false,
    ...overrides,
  };
}

/** Empty create form — Figma 6912:56200. */
export function createEmptyProcedureForm(): LotoProcedureFormState {
  return {
    equipmentName: "",
    location: null,
    hazardLevel: "Medium",
    description: "",
    // One step, not two. A procedure needs at least one isolation step and no
    // more than that can be assumed — seeding a second left an empty card the
    // author had to notice and delete, and it put a delete icon on step 1 from
    // the outset, which is only offered once a second step actually exists.
    //
    // Stable id so SSR HTML and the hydrating client render the same form
    // `id`s. A module-level counter would keep climbing across Strict Mode
    // remounts and mismatch (step-1 on the server vs step-5 on the client).
    steps: [createEmptyIsolationStep({ id: "step-1" })],
    verificationMethod: "",
    additionalNotes: "",
    selectedPpe: [],
    selectedPersonnel: [],
  };
}

export function hazardLevelClassName(level: LotoHazardLevel): string {
  if (level === "High") return "text-ehs-red";
  if (level === "Medium") return "text-ehs-yellow";
  if (level === "Low") return "text-ehs-green";
  return "text-ehs-darker";
}
