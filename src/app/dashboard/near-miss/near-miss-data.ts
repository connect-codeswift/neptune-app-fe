export type NearMissStatus =
  | "Triage"
  | "Investigating"
  | "Mitigated"
  | "Closed";
export type NearMissSeverity = "High" | "Medium" | "Low";

export type NearMissRecord = Readonly<{
  id: string;
  title: string;
  reporter: string;
  site: string;
  status: NearMissStatus;
  severity: NearMissSeverity;
  age: string;
  description: string;
}>;

export const NEAR_MISS_RECORDS: readonly NearMissRecord[] = [
  {
    id: "NM-1141",
    title: "Exposed cable run · forklift aisle",
    reporter: "Dana Kim",
    site: "Warehouse 1",
    status: "Triage",
    severity: "High",
    age: "2h",
    description:
      "Exposed power cable lying across the main forklift corridor in Warehouse 1.",
  },
  {
    id: "NM-1140",
    title: "Missing machine guard · grinder #3",
    reporter: "Priya Mehra",
    site: "Plant B · Fab 1",
    status: "Investigating",
    severity: "Medium",
    age: "4h",
    description:
      "Safety guard on grinder #3 was removed and not replaced after maintenance.",
  },
  {
    id: "NM-1139",
    title: "Slippery floor near coolant return",
    reporter: "Maria Lopez",
    site: "Plant A · Line 2",
    status: "Triage",
    severity: "Low",
    age: "5h",
    description:
      "Coolant leak near press #4 has made the walkway extremely slick.",
  },
  {
    id: "NM-1138",
    title: "Blocked fire exit pathway",
    reporter: "Marie Curie",
    site: "Plant A · Warehouse A",
    status: "Mitigated",
    severity: "High",
    age: "1d",
    description: "Pallets stacked high in front of the emergency exit door.",
  },
  {
    id: "NM-1137",
    title: "Exposed wiring on cutter station",
    reporter: "Nikola Tesla",
    site: "Plant A · Line 3",
    status: "Closed",
    severity: "High",
    age: "2d",
    description: "Plastic housing cracked, exposing live 24V wires.",
  },
];
