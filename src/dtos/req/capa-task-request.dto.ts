/** Body for POST /api/v1/capa-tasks/{taskId} (create with `id: 0`) and PUT /api/v1/capa-tasks/{taskId} (update). */
export type CapaTaskRequestDto = {
  id: number;
  capaId: number;
  task: string;
  priority?: "Low" | "Medium" | "High" | string | null;
  dueDate?: string | null;
  userId: number;
};
