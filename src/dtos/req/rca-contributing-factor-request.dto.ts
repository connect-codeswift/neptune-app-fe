/** Request body for POST /api/v1/rca-contributing-factors */
export type CreateContributingFactorRequestDto = Readonly<{
  incidentId: number;
  /** CAPA parent for a CAPA-scoped RCA; mutually exclusive with `incidentId`. */
  capaId?: number;
  rcaCategoryId: number;
  description: string;
  userId: number;
}>;

/** Request body for PUT /api/v1/rca-contributing-factors */
export type UpdateContributingFactorRequestDto = Readonly<{
  siteId: number;
  userId: number;
  incidentId: number;
  contributingFactorId: number;
  rcaCategoryId: number;
  description: string;
}>;

/** Request body for PATCH /api/v1/rca-contributing-factors/{id} */
export type DropContributingFactorRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
