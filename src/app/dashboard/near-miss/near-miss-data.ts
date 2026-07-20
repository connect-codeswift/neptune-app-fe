export type NearMissStatus = "Open" | "Investigating" | "Closed";
export type NearMissSeverity = "High" | "Medium" | "Low";

export type NearMissRelatedCapa = Readonly<{
  id: string;
  title: string;
}>;

export type NearMissRecord = Readonly<{
  id: string;
  title: string;
  /** Display label for the hazard type, e.g. "Mechanical". */
  hazardType: string;
  /** Display label for where the event happened, e.g. "Plant A · Line 2". */
  location: string;
  reporter: string;
  site: string;
  status: NearMissStatus;
  age: string;
  description: string;
  /** ISO date of the event, shown as "Date" on the detail view. */
  dateOfEvent: string;
  contributingFactors: readonly string[];
  relatedCapas: readonly NearMissRelatedCapa[];
}>;

export function findNearMissRecord(id: string): NearMissRecord | undefined {
  return NEAR_MISS_RECORDS.find((record) => record.id === id);
}

export const NEAR_MISS_RECORDS: readonly NearMissRecord[] = [
  {
    id: "NM-1141",
    title: "Exposed cable run · forklift aisle",
    hazardType: "Electrical",
    location: "Warehouse 1",
    reporter: "Dana Kim",
    site: "Warehouse 1",
    status: "Open",
    age: "2h",
    description:
      "Exposed power cable lying across the main forklift corridor in Warehouse 1.",
    dateOfEvent: "2025-03-13",
    contributingFactors: ["LOTO not applied", "PPE not worn"],
    relatedCapas: [
      {
        id: "CAPA-2025-001",
        title: "Install Machine Guard on Press Station 4",
      },
    ],
  },
  {
    id: "NM-1140",
    title: "Missing machine guard · grinder #3",
    hazardType: "Mechanical",
    location: "Plant B · Fab 1",
    reporter: "Priya Mehra",
    site: "Plant B · Fab 1",
    status: "Investigating",
    age: "4h",
    description:
      "Safety guard on grinder #3 was removed and not replaced after maintenance.",
    dateOfEvent: "2025-03-12",
    contributingFactors: ["Guard removed", "Maintenance sign-off missed"],
    relatedCapas: [
      { id: "CAPA-2025-004", title: "Re-fit guard and re-train maintenance" },
    ],
  },
  {
    id: "NM-1139",
    title: "Slippery floor near coolant return",
    hazardType: "Slip / Trip / Fall",
    location: "Plant A · Line 2",
    reporter: "Maria Lopez",
    site: "Plant A · Line 2",
    status: "Open",
    age: "5h",
    description:
      "Coolant leak near press #4 has made the walkway extremely slick.",
    dateOfEvent: "2025-03-11",
    contributingFactors: ["Housekeeping lapse"],
    relatedCapas: [],
  },
  {
    id: "NM-1138",
    title: "Blocked fire exit pathway",
    hazardType: "Fire / Explosion",
    location: "Plant A · Warehouse A",
    reporter: "Marie Curie",
    site: "Plant A · Warehouse A",
    status: "Closed",
    age: "1d",
    description: "Pallets stacked high in front of the emergency exit door.",
    dateOfEvent: "2025-03-10",
    contributingFactors: ["Storage overflow", "Egress not checked"],
    relatedCapas: [
      { id: "CAPA-2025-002", title: "Re-stripe and audit egress routes" },
    ],
  },
  {
    id: "NM-1137",
    title: "Exposed wiring on cutter station",
    hazardType: "Electrical",
    location: "Plant A · Line 3",
    reporter: "Nikola Tesla",
    site: "Plant A · Line 3",
    status: "Closed",
    age: "2d",
    description: "Plastic housing cracked, exposing live 24V wires.",
    dateOfEvent: "2025-03-09",
    contributingFactors: ["Damaged equipment", "Inspection overdue"],
    relatedCapas: [
      { id: "CAPA-2025-003", title: "Replace cutter station housing" },
    ],
  },
];
