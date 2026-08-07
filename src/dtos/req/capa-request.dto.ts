/**
 * Body for POST /api/CAPA/Capa (create with `id: 0`) and
 * PUT /api/CAPA/Capa (update with existing `id`).
 */
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
};

export type UpdateCapaRequestDto = CreateCapaRequestDto & {
  id: number;
};
