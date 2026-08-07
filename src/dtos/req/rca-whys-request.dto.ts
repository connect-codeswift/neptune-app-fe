/** Single why step in POST /api/Rca/Whys request body. */
export type RcaWhyInputDto = Readonly<{
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Request body for POST /api/Rca/Whys */
export type CreateRcaWhysRequestDto = Readonly<{
  contributingFactorId: number;
  userId: number;
  whys: readonly RcaWhyInputDto[];
}>;

/** Request body for PUT /api/Rca/Why */
export type UpdateRcaWhyRequestDto = Readonly<{
  siteId: number;
  userId: number;
  whyId: number;
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Request body for PATCH /api/Rca/Why/Drop/{id} */
export type DropRcaWhyRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
