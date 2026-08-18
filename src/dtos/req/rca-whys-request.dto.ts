/** Single why step in POST /api/v1/rca-whys request body. */
export type RcaWhyInputDto = Readonly<{
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Request body for POST /api/v1/rca-whys */
export type CreateRcaWhysRequestDto = Readonly<{
  contributingFactorId: number;
  userId: number;
  whys: readonly RcaWhyInputDto[];
}>;

/** Request body for PUT /api/v1/rca-whys */
export type UpdateRcaWhyRequestDto = Readonly<{
  siteId: number;
  userId: number;
  whyId: number;
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Request body for PATCH /api/v1/rca-whys/{id} */
export type DropRcaWhyRequestDto = Readonly<{
  siteId: number;
  userId: number;
}>;
