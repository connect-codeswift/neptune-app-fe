import type { CapaTaskStatus } from "@/dtos/req/capa-task-status-request.dto";

export type CapaTaskDto = {
  id: number;
  capaId: number;
  task: string;
  ownerId?: number | null;
  ownerName?: string | null;
  dueDate?: string | null;
  userId: number;
  status?: CapaTaskStatus | null;
  createdAt?: string | null;
};
