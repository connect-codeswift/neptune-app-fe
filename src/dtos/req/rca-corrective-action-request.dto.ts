/** Request body for POST /api/v1/rca-corrective-actions */
export type CreateRcaCorrectiveActionRequestDto = Readonly<{
  contributingFactorId: number;
  userId: number;
  description: string;
}>;

/** Request body for PUT /api/v1/rca-corrective-actions */
export type UpdateRcaCorrectiveActionRequestDto = Readonly<{
  siteId: number;
  userId: number;
  correctiveActionId: number;
  description: string;
}>;

/** Request body for PATCH /api/v1/rca-corrective-actions/{id} */
export type DropRcaCorrectiveActionRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
