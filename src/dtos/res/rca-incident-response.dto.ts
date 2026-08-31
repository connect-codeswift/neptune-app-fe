import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Why step returned on GET /api/v1/incidents/{incidentId}/rca. */
export type RcaWhyItemDto = Readonly<{
  id: number;
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Corrective action returned on GET /api/v1/incidents/{incidentId}/rca. */
export type RcaCorrectiveActionItemDto = Readonly<{
  id: number;
  description: string;
}>;

/** Contributing factor (one HRCA lane) from GET /api/v1/incidents/{incidentId}/rca. */
export type RcaContributingFactorDto = Readonly<{
  id: number;
  description: string;
  incidentId: number;
  capaId?: number | null;
  rcaCategoryId: number;
  rcaCategoryName: string;
  siteId: number;
  userId: number;
  whys: readonly RcaWhyItemDto[];
  correctiveActions: readonly RcaCorrectiveActionItemDto[];
}>;

/** Swagger envelope for GET /api/v1/incidents/{incidentId}/rca. */
export type RcaIncidentEnvelopeDto = ApiEnvelopeDto<RcaContributingFactorDto[]>;

/** Swagger envelope for POST /api/v1/rca-contributing-factors. */
export type RcaContributingFactorEnvelopeDto =
  ApiEnvelopeDto<RcaContributingFactorDto>;

/** Swagger envelope for POST /api/v1/rca-whys. */
export type RcaWhysEnvelopeDto = ApiEnvelopeDto<RcaWhyItemDto[]>;

/** Swagger envelope for PUT /api/v1/rca-whys. */
export type RcaWhyEnvelopeDto = ApiEnvelopeDto<RcaWhyItemDto>;

/** Swagger envelope for POST /api/v1/rca-corrective-actions. */
export type RcaCorrectiveActionEnvelopeDto =
  ApiEnvelopeDto<RcaCorrectiveActionItemDto>;
