import { LOTO_EQUIPMENT } from "./loto-data";

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

export type LotoProcedurePersonnelOption = Readonly<{
  id: string;
  name: string;
  initials: string;
}>;

export type LotoProcedureFormState = {
  equipmentName: string;
  equipmentCode: string;
  location: string;
  hazardLevel: LotoHazardLevel;
  description: string;
  steps: LotoIsolationStep[];
  verificationMethod: string;
  additionalNotes: string;
  selectedPpe: string[];
  selectedPersonnelIds: string[];
};

export const LOTO_ROUTE = "/dashboard/lockout-tagout";
export const LOTO_PROCEDURE_CREATE_ROUTE = `${LOTO_ROUTE}/procedure/create`;

export function lotoProcedureEditRoute(equipmentId: string): string {
  return `${LOTO_ROUTE}/procedure/${equipmentId}/edit`;
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

export const LOTO_ISOLATION_METHODS = [
  "Lockout",
  "Tagout",
  "Lockout / Tagout",
  "Disconnect",
  "Block / Bleed",
  "Notify Only",
  "Verify Zero Energy",
] as const;

export const LOTO_PPE_OPTIONS = [
  "Safety glasses",
  "Face shield",
  "Insulated gloves",
  "Hard hat",
  "Arc flash PPE",
  "Safety boots",
  "Hearing protection",
  "Chemical gloves",
  "Respirator",
] as const;

export const LOTO_PROCEDURE_PERSONNEL: readonly LotoProcedurePersonnelOption[] =
  [
    { id: "dc", name: "David Chen", initials: "DC" },
    { id: "sm", name: "Sarah Mitchell", initials: "SM" },
    { id: "cr", name: "Carlos Rivera", initials: "CR" },
    { id: "jo", name: "James Okonkwo", initials: "JO" },
    { id: "ps", name: "Priya Sharma", initials: "PS" },
  ];

let stepSeq = 0;

export function createEmptyIsolationStep(
  overrides: Partial<LotoIsolationStep> = {},
): LotoIsolationStep {
  stepSeq += 1;
  return {
    id: `step-${String(stepSeq)}`,
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
    equipmentCode: "",
    location: "",
    hazardLevel: "Medium",
    description: "",
    steps: [createEmptyIsolationStep(), createEmptyIsolationStep()],
    verificationMethod: "",
    additionalNotes: "",
    selectedPpe: [],
    selectedPersonnelIds: ["dc"],
  };
}

/** Edit sample — Figma 6915:56769 (EQ-0042). */
export const LOTO_EDIT_PROCEDURE_SAMPLE: LotoProcedureFormState = {
  equipmentName: "Conveyor Belt Motor CB-04",
  equipmentCode: "EQ-0042",
  location: "Plant B - Line 3",
  hazardLevel: "High",
  description: "",
  steps: [
    createEmptyIsolationStep({
      description: "Notify all affected employees of planned lockout/tagout",
      isolationPoint: "All personnel in area",
      energyType: "Other",
      isolationMethod: "Notify Only",
      lockTagPosition: "N/A",
      verified: true,
    }),
    createEmptyIsolationStep({
      description: "Shutdown equipment using normal stopping procedure",
      isolationPoint: "Main control panel - E-Stop",
      energyType: "Electrical",
      isolationMethod: "Disconnect",
      lockTagPosition: "Off",
      verified: true,
    }),
    createEmptyIsolationStep({
      description: "Isolate main power supply at main disconnect",
      isolationPoint: "MCC Panel CB-04 Breaker",
      energyType: "Electrical",
      isolationMethod: "Lockout / Tagout",
      lockTagPosition: "Open/Off",
      verified: true,
    }),
    createEmptyIsolationStep({
      description: "Block belt tension and mechanical movement",
      isolationPoint: "Belt tensioner arm",
      energyType: "Mechanical",
      isolationMethod: "Block / Bleed",
      lockTagPosition: "Secured",
      verified: false,
    }),
    createEmptyIsolationStep({
      description:
        "Verify zero energy state - attempt restart and test controls",
      isolationPoint: "Main control panel",
      energyType: "Electrical",
      isolationMethod: "Verify Zero Energy",
      lockTagPosition: "Off",
      verified: false,
    }),
  ],
  verificationMethod: "",
  additionalNotes: "",
  selectedPpe: [
    "Safety glasses",
    "Face shield",
    "Insulated gloves",
    "Arc flash PPE",
    "Hard hat",
  ],
  selectedPersonnelIds: ["dc", "sm"],
};

function cloneProcedureForm(
  source: LotoProcedureFormState,
): LotoProcedureFormState {
  return {
    ...source,
    steps: source.steps.map((step) => ({ ...step })),
    selectedPpe: [...source.selectedPpe],
    selectedPersonnelIds: [...source.selectedPersonnelIds],
  };
}

export function getProcedureFormForEquipment(
  equipmentId: string,
): LotoProcedureFormState {
  const equipment = LOTO_EQUIPMENT.find((item) => item.id === equipmentId);
  const base = cloneProcedureForm(LOTO_EDIT_PROCEDURE_SAMPLE);

  if (!equipment) {
    return base;
  }

  const codeMatch = equipment.procedureId.match(/\d+$/);
  const equipmentCode = codeMatch
    ? `EQ-${codeMatch[0].padStart(4, "0")}`
    : `EQ-${equipment.id.replace("eq-", "00")}`;

  return {
    ...base,
    equipmentName: equipment.name,
    equipmentCode,
    location: equipment.location,
  };
}

export function hazardLevelClassName(level: LotoHazardLevel): string {
  if (level === "High") return "text-[#ef4444]";
  if (level === "Medium") return "text-[#f59e0b]";
  if (level === "Low") return "text-[#10b981]";
  return "text-ehs-darker";
}
