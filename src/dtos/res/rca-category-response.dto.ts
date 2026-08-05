import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Single RCA category row from GET /api/Rca/Categories `dataModel`. */
export type RcaCategoryDto = Readonly<{
  id: number;
  name: string;
}>;

/** Swagger envelope for GET /api/Rca/Categories. */
export type RcaCategoriesEnvelopeDto = ApiEnvelopeDto<RcaCategoryDto[]>;

/** Swagger envelope for POST /api/Rca/Categories. */
export type RcaCategoryEnvelopeDto = ApiEnvelopeDto<RcaCategoryDto>;
