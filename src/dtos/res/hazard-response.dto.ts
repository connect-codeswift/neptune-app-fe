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
 * KPI counters from GET /api/Hazard/HazardKpiCount.
 */
export type HazardKpiDto = {
  totalHazards: number;
  /** Period-over-period delta for total hazards (renders as `+N` / `-N`). */
  totalHazardsDelta?: number;
  totalHazardsChange?: number;
  hazardConvertedToIncidentCount: number;
  /** Period-over-period delta for converted incidents (renders as `+N` / `-N`). */
  hazardConvertedToIncidentDelta?: number;
  hazardConvertedToIncidentChange?: number;
};

/** Matches backend response for GET /api/Hazard/HazardKpiCount. */
export type GetHazardKpiResponseDto = ApiEnvelopeDto<HazardKpiDto | null>;

/** One cell of GET /api/Hazard/HazardApiForHeatMap — a location/type tally. */
export type HazardHeatMapCellDto = {
  location: string;
  type: string;
  count: number;
};

/** Matches backend response for GET /api/Hazard/HazardApiForHeatMap. */
export type GetHazardHeatMapResponseDto = ApiEnvelopeDto<
  HazardHeatMapCellDto[] | null
>;

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

/**
 * GET /api/Hazard/MonthlyHazardUsers?year=&month= — same row shape as
 * TopHazardUsers, scoped to one calendar month.
 */
export type GetMonthlyHazardUsersResponseDto = GetTopHazardUsersResponseDto;
