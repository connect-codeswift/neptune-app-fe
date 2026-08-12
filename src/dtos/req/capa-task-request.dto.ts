/** Body for POST /api/CAPA/Task (create with `id: 0`) and PUT /api/CAPA/Task (update). */
export type CapaTaskRequestDto = {
  id: number;
  capaId: number;
  task: string;
  priority?: "Low" | "Medium" | "High" | string | null;
  ownerId?: number | null;
  dueDate?: string | null;
  userId: number;
};
