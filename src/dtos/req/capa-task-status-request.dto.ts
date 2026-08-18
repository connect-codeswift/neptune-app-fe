/** Allowed values for PATCH /api/v1/capa-tasks/{taskId}/status (`CapaTaskStatusDto.status`). */
export type CapaTaskStatus = "NotStarted" | "InProcess" | "Completed";

/** Body for PATCH /api/v1/capa-tasks/{taskId}/status. */
export type CapaTaskStatusRequestDto = {
  id: number;
  status: CapaTaskStatus;
  userId: number;
};
