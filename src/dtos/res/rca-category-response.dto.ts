import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Single RCA category row from GET /api/v1/rca-categories `dataModel`. */
export type RcaCategoryDto = Readonly<{
  id: number;
  name: string;
}>;

/** Swagger envelope for GET /api/v1/rca-categories. */
export type RcaCategoriesEnvelopeDto = ApiEnvelopeDto<RcaCategoryDto[]>;

/** Swagger envelope for POST /api/v1/rca-categories. */
export type RcaCategoryEnvelopeDto = ApiEnvelopeDto<RcaCategoryDto>;
