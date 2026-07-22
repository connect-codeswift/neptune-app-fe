export type CapaItem = Readonly<{
  id: string;
  code: string;
  controlCategory: string;
  actionType: "Corrective" | "Preventive";
  status: "In progress" | "Planning" | "Verified" | "Closed";
  statusTone?: "blue" | "gray" | "green";
  title: string;
  assignee: string;
  dueDate: string;
  progressPercent: number;
}>;

export type HierarchyControlRow = Readonly<{
  label: string;
  count: number;
}>;

export type CapaSummaryCounts = Readonly<{
  totalCount: number;
  inProgressCount: number;
  verifiedCount: number;
  planningCount: number;
}>;
