import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Created near-miss record returned by POST /api/NearMiss/NearMiss. */
export type CreateNearMissResponseDto = CreateNearMissRequestDto;

/** Matches backend response for POST /api/NearMiss/GetAllNearMiss. */
export type GetAllNearMissResponseDto = ApiEnvelopeDto<
  PagedDataDto<CreateNearMissResponseDto>
>;

/** Matches backend response for GET /api/NearMiss/NearMiss/{id}. */
export type GetNearMissByIdResponseDto =
  ApiEnvelopeDto<CreateNearMissResponseDto | null>;
