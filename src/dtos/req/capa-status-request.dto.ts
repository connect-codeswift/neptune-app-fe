/** PATCH /api/CAPA/Capa/{id}/status — only `Open` is accepted (manual reopen). */
export type CapaStatusRequestDto = {
  status: "Open";
};
