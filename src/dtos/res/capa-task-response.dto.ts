export type CapaTaskDto = {
  id: number;
  capaId: number;
  task: string;
  ownerId?: number | null;
  dueDate?: string | null;
  userId: number;
};
