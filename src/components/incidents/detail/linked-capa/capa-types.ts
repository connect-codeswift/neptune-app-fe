export type CapaItem = Readonly<{
  id: string;
  numericId: number;
  incidentId: number;
  userId: number;
  assignedId: number | null;
  rcaId: number | null;
  description: string;
  isDrop: boolean;
  code: string;
  controlCategory: string;
  actionType: "Corrective" | "Preventive";
  status: "In progress" | "Planning" | "Verified" | "Closed";
  statusTone?: "blue" | "gray" | "green";
  title: string;
  assignee: string;
  dueDate: string;
  priority: string;
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
