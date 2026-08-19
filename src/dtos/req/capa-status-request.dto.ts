/** PATCH /api/v1/capas/{id}/status — only `Open` is accepted (manual reopen). */
export type CapaStatusRequestDto = {
  status: "Open";
};
