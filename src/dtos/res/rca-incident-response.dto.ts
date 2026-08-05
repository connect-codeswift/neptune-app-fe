import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Why step returned on GET /api/Rca/Incident/{incidentId}. */
export type RcaWhyItemDto = Readonly<{
  id: number;
  stepNumber: number;
  description: string;
  isRootCause: boolean;
}>;

/** Corrective action returned on GET /api/Rca/Incident/{incidentId}. */
export type RcaCorrectiveActionItemDto = Readonly<{
  id: number;
  description: string;
}>;

/** Contributing factor (one HRCA lane) from GET /api/Rca/Incident/{incidentId}. */
export type RcaContributingFactorDto = Readonly<{
  id: number;
  description: string;
  incidentId: number;
  rcaCategoryId: number;
  rcaCategoryName: string;
  siteId: number;
  userId: number;
  whys: readonly RcaWhyItemDto[];
  correctiveActions: readonly RcaCorrectiveActionItemDto[];
}>;

/** Swagger envelope for GET /api/Rca/Incident/{incidentId}. */
export type RcaIncidentEnvelopeDto = ApiEnvelopeDto<RcaContributingFactorDto[]>;

/** Swagger envelope for POST /api/Rca/ContributingFactor. */
export type RcaContributingFactorEnvelopeDto =
  ApiEnvelopeDto<RcaContributingFactorDto>;

/** Swagger envelope for POST /api/Rca/Whys. */
export type RcaWhysEnvelopeDto = ApiEnvelopeDto<RcaWhyItemDto[]>;

/** Swagger envelope for PUT /api/Rca/Why. */
export type RcaWhyEnvelopeDto = ApiEnvelopeDto<RcaWhyItemDto>;

/** Swagger envelope for POST /api/Rca/CorrectiveAction. */
export type RcaCorrectiveActionEnvelopeDto =
  ApiEnvelopeDto<RcaCorrectiveActionItemDto>;
