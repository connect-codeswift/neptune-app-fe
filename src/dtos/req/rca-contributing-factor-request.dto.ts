/** Request body for POST /api/Rca/ContributingFactor */
export type CreateContributingFactorRequestDto = Readonly<{
  incidentId: number;
  rcaCategoryId: number;
  description: string;
  userId: number;
}>;

/** Request body for PUT /api/Rca/ContributingFactor */
export type UpdateContributingFactorRequestDto = Readonly<{
  siteId: number;
  userId: number;
  incidentId: number;
  contributingFactorId: number;
  rcaCategoryId: number;
  description: string;
}>;

/** Request body for PATCH /api/Rca/ContributingFactor/Drop/{id} */
export type DropContributingFactorRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
