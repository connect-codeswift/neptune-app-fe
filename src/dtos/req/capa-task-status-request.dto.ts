/** Allowed values for PATCH /api/CAPA/Task/Status (`CapaTaskStatusDto.status`). */
export type CapaTaskStatus = "NotStarted" | "InProcess" | "Completed";

/** Body for PATCH /api/CAPA/Task/Status. */
export type CapaTaskStatusRequestDto = {
  id: number;
  status: CapaTaskStatus;
  userId: number;
};
