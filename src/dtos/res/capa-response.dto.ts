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
  /** Derived server-side: past `dueDate` and not Closed. Never a stored status. */
  isOverdue?: boolean | null;
  /** Where it came from: Incident | Rca | Hazard | NearMiss, or null for standalone. */
  sourceType?: string | null;
  /** Id within `sourceType` — what the Source link routes to. */
  sourceId?: number | null;
  /** Who raised it, as opposed to who owns it. */
  createdByName?: string | null;
  /** Who signed it off. Null until the CAPA is closed. */
  verifiedByName?: string | null;
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
