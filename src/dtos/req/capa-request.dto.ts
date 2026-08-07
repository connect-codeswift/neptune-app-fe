/**
 * Body for POST /api/CAPA/Capa.
 * `id` is required by the schema; send `0` for create.
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
