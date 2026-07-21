export type HazardStatus = "Open" | "Investigating" | "Closed";
export type HazardSeverity = "High" | "Medium" | "Low";

export type HazardRecord = Readonly<{
  id: string;
  title: string;
  reporter: string;
  site: string;
  severity: HazardSeverity;
  status: HazardStatus;
  age: string;
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
  },
  {
    id: "HZ-1140",
    title: "Missing machine guard · grinder #3",
    reporter: "Priya Mehra",
    site: "Plant B · Fab 1",
    severity: "High",
    status: "Investigating",
    age: "4h",
  },
  {
    id: "HZ-1139",
    title: "Slippery floor near coolant return",
    reporter: "Maria Lopez",
    site: "Plant A · Line 2",
    severity: "Low",
    status: "Open",
    age: "5h",
  },
  {
    id: "HZ-1138",
    title: "Blocked fire exit pathway",
    reporter: "Marie Curie",
    site: "Plant A · Warehouse A",
    severity: "High",
    status: "Closed",
    age: "1d",
  },
];
