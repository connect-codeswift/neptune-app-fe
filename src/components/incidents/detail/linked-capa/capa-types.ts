import type { CapaTaskStatus } from "@/dtos/req/capa-task-status-request.dto";

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
  /** First linked task id — used to read assignee progress from GET /CAPA/Tasks. */
  primaryTaskId: number | null;
  /** Assignee task status from GET /CAPA/Tasks/{capaId} (updated by the assignee). */
  taskStatus: CapaTaskStatus | null;
}>;

export type HierarchyControlRow = Readonly<{
  label: string;
  count: number;
}>;

export type CapaSummaryCounts = Readonly<{
  totalCount: number;
  notStartedCount: number;
  inProgressCount: number;
  completedCount: number;
}>;
