/**
 * Matches backend `CapaDto` from OpenAPI (`sw.json`).
 * Extra optional fields are tolerated when the API returns them.
 */
export type CapaDto = {
  id: number;
  title?: string | null;
  capaType: string;
  priority: string;
  controlLevel: string;
  description: string;
  userId: number;
  incidentId: number;
  assignedId?: number | null;
  rcaId?: number | null;
  dueDate?: string | null;
  isDrop?: boolean;
  /** Undocumented / future fields */
  status?: string | null;
  /** Remaining days until due; negative when overdue (list API). */
  daysLeft?: number | null;
  progressPercent?: number | null;
  progress?: number | null;
  progressPercentage?: number | null;
  assigneeName?: string | null;
  assignedName?: string | null;
  ownerName?: string | null;
  sourceInfo?: string | null;
  code?: string | null;
  capaCode?: string | null;
};
