import type { CreateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Created hazard record returned by POST /api/Hazard/Hazards. */
export type CreateHazardResponseDto = ApiEnvelopeDto<CreateHazardRequestDto>;

/** A hazard row as returned by the list endpoint. */
export type HazardDto = CreateHazardRequestDto & {
  id: number;
  status: string;
  createdDate: string;
  updatedAt: string | null;
};

/** Matches backend response for POST /api/Hazard/GetAllHazard. */
export type GetAllHazardResponseDto = ApiEnvelopeDto<PagedDataDto<HazardDto>>;

/** Matches backend response for GET /api/Hazard/Hazard/{id}. */
export type GetHazardByIdResponseDto = ApiEnvelopeDto<HazardDto | null>;

/**
 * KPI counters from GET /api/Hazard/HazardKpi. The backend's exact key names
 * aren't pinned down yet, so the likely spellings are optional here and the
 * page reads whichever is present.
 */
export type HazardKpiDto = {
  totalHazardCount?: number;
  totalHazardReports?: number;
  total?: number;
  convertedToIncidents?: number;
  convertedIncidents?: number;
  converted?: number;
};

/** One row of GET /api/Hazard/TopHazardUsers. */
export type TopHazardUserDto = {
  userId: number;
  userName: string;
  hazardCount: number;
};

/** Matches backend response for GET /api/Hazard/TopHazardUsers. */
export type GetTopHazardUsersResponseDto = ApiEnvelopeDto<
  TopHazardUserDto[] | null
>;

/** Matches backend response for GET /api/Hazard/HazardKpi. */
export type GetHazardKpiResponseDto = ApiEnvelopeDto<HazardKpiDto | null>;
