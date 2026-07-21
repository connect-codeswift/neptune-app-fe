export type HazardStatus = "Open" | "Investigating" | "Closed";
export type HazardSeverity = "High" | "Medium" | "Low";

/** Ordered stages of the hazard workflow, as shown on the detail page. */
export const HAZARD_WORKFLOW_STAGES = [
  "Reported",
  "Assessed",
  "Mitigated",
  "Verified",
  "Closed",
] as const;

export type HazardStage = (typeof HAZARD_WORKFLOW_STAGES)[number];

export type HazardCapa = Readonly<{
  id: string;
  title: string;
  status: string;
}>;

export type HazardRecord = Readonly<{
  id: string;
  title: string;
  reporter: string;
  site: string;
  severity: HazardSeverity;
  status: HazardStatus;
  age: string;
  /** Stage currently in progress; every earlier stage counts as complete. */
  stage: HazardStage;
  hazardType: string;
  category: string;
  description: string;
  dateReported: string;
  assignedTo: string;
  /** Raw user id behind {@link assignedTo}; 0 / absent when unassigned. */
  assignedToId?: number;
  location: string;
  /** Cloudinary URL of the attached photo evidence, when one was uploaded. */
  image?: string;
  relatedCapas: readonly HazardCapa[];
}>;

export const HAZARD_RECORDS: readonly HazardRecord[] = [
  {
    id: "HZ-1141",
    title: "Exposed cable run · forklift aisle",
    reporter: "Dana Kim",
    site: "Warehouse 1",
    severity: "Medium",
    status: "Open",
    age: "2h",
    stage: "Mitigated",
    hazardType: "Electrical",
    category: "Electrical",
    description:
      "Power cable run left unprotected across the forklift aisle. Traffic crosses it on every pallet move, risking abrasion and arc flash.",
    dateReported: "2025-03-06",
    assignedTo: "David Chen",
    location: "Warehouse 1 / Forklift Aisle B",
    relatedCapas: [
      {
        id: "CAPA-2025-014",
        title: "Install overhead cable tray across aisle B",
        status: "In Progress",
      },
    ],
  },
  {
    id: "HZ-1140",
    title: "Missing machine guard · grinder #3",
    reporter: "Priya Mehra",
    site: "Plant B · Fab 1",
    severity: "High",
    status: "Investigating",
    age: "4h",
    stage: "Mitigated",
    hazardType: "Mechanical",
    category: "Mechanical",
    description:
      "Fixed guard absent from the pedestal grinder. Rotating wheel is exposed at the operator position.",
    dateReported: "2025-03-05",
    assignedTo: "Tom Bradley",
    location: "Plant B / Fab 1 · Tool Room",
    relatedCapas: [
      {
        id: "CAPA-2025-001",
        title: "Install machine guard on grinder #3",
        status: "In Progress",
      },
      {
        id: "CAPA-2025-002",
        title: "Re-run guarding audit across Fab 1",
        status: "Open",
      },
    ],
  },
  {
    id: "HZ-1139",
    title: "Slippery floor near coolant return",
    reporter: "Maria Lopez",
    site: "Plant A · Line 2",
    severity: "Low",
    status: "Open",
    age: "5h",
    stage: "Reported",
    hazardType: "Slip / Trip / Fall",
    category: "Housekeeping",
    description:
      "Coolant seeping from the return line leaves a persistent film on the walkway beside Line 2.",
    dateReported: "2025-03-05",
    assignedTo: "Unassigned",
    location: "Plant A / Line 2 · Walkway",
    relatedCapas: [],
  },
  {
    id: "HZ-1138",
    title: "Blocked fire exit pathway",
    reporter: "Marie Curie",
    site: "Plant A · Warehouse A",
    severity: "High",
    status: "Closed",
    age: "1d",
    stage: "Closed",
    hazardType: "Fire / Explosion",
    category: "Emergency Egress",
    description:
      "Staged pallets blocked the east fire exit for a full shift. Egress route restored and re-marked.",
    dateReported: "2025-03-04",
    assignedTo: "David Chen",
    location: "Plant A / Warehouse A · East Exit",
    relatedCapas: [
      {
        id: "CAPA-2025-009",
        title: "Floor-mark keep-clear zones at all egress doors",
        status: "Closed",
      },
    ],
  },
];

/** Look up a hazard by id (case-insensitive). Returns null when unknown. */
export function getHazardById(id: string): HazardRecord | null {
  const match = HAZARD_RECORDS.find(
    (record) => record.id.toLowerCase() === id.toLowerCase(),
  );
  return match ?? null;
}
