/** Request body for POST /api/Rca/CorrectiveAction */
export type CreateRcaCorrectiveActionRequestDto = Readonly<{
  contributingFactorId: number;
  userId: number;
  description: string;
}>;

/** Request body for PUT /api/Rca/CorrectiveAction */
export type UpdateRcaCorrectiveActionRequestDto = Readonly<{
  siteId: number;
  userId: number;
  correctiveActionId: number;
  description: string;
}>;

/** Request body for PATCH /api/Rca/CorrectiveAction/Drop/{id} */
export type DropRcaCorrectiveActionRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
