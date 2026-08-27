/**
 * Body for POST /api/v1/capas (create with `id: 0`) and
 * PUT /api/v1/capas (update with existing `id`).
 */
/**
 * One checklist task supplied at create time. Matches `CapaTaskItemDto`: the API takes
 * only these three, deriving the owner from the CAPA's assignee and the author from the
 * token. All three are required - a task with no due date is rejected.
 */
export type CreateCapaTaskItemDto = {
  task: string;
  dueDate: string;
  priority: string;
};

export type CreateCapaRequestDto = {
  id: number;
  title: string;
  capaType: "Corrective" | "Preventive" | string;
  priority: "Low" | "Medium" | "High" | string;
  controlLevel: string;
  description: string;
  userId: number;
  incidentId: number;
  rcaId?: number | null;
  assignedId?: number | null;
  dueDate?: string | null;
  isDrop?: boolean;
  /**
   * Saved with the CAPA in one transaction. Ignored on update - editing a task goes
   * through the task endpoints.
   */
  tasks?: readonly CreateCapaTaskItemDto[];
};

export type UpdateCapaRequestDto = CreateCapaRequestDto & {
  id: number;
};
