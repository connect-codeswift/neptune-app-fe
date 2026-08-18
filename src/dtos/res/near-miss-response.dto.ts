import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Created near-miss record returned by POST /api/NearMiss/NearMiss. */
export type CreateNearMissResponseDto = CreateNearMissRequestDto & {
  /** Server-side creation timestamp; drives the table's Age column. */
  createdAt?: string;
  /** "Open" | "Investigating" | "Closed"; null on records created before it existed. */
  status?: string | null;
};

/** Matches backend response for POST /api/NearMiss/GetAllNearMiss. */
export type GetAllNearMissResponseDto = ApiEnvelopeDto<
  PagedDataDto<CreateNearMissResponseDto>
>;

/**
 * KPI counters from GET /api/NearMiss/NearMissKpi. Key names aren't pinned
 * down yet, so the likely spellings are optional here.
 */
export type NearMissKpiDto = {
  totalNearMissCount?: number;
  totalNearMisses?: number;
  total?: number;
  /** Period-over-period delta for total near misses (renders as `+N` / `-N`). */
  totalNearMissDelta?: number;
  totalNearMissChange?: number;
  convertedToIncidents?: number;
  convertedIncidents?: number;
  converted?: number;
  /** Period-over-period delta for converted incidents (renders as `+N` / `-N`). */
  convertedToIncidentsDelta?: number;
  convertedToIncidentsChange?: number;
};

/** Matches backend response for GET /api/NearMiss/NearMissKpi. */
export type GetNearMissKpiResponseDto = ApiEnvelopeDto<NearMissKpiDto | null>;

/** One cell of GET /api/NearMiss/NearMissApiForHeatMap — a location/type tally. */
export type NearMissHeatMapCellDto = {
  location: string;
  /** Present when the backend groups by department instead of (or as well as) location. */
  department?: string;
  type: string;
  count: number;
};

/** Matches backend response for GET /api/NearMiss/NearMissApiForHeatMap. */
export type GetNearMissHeatMapResponseDto = ApiEnvelopeDto<
  NearMissHeatMapCellDto[] | null
>;

/** One row of GET /api/NearMiss/TopNearMissUsers. */
export type TopNearMissUserDto = {
  userId: number;
  userName: string;
  nearMissCount: number;
};

/** Matches backend response for GET /api/NearMiss/TopNearMissUsers. */
export type GetTopNearMissUsersResponseDto = ApiEnvelopeDto<
  TopNearMissUserDto[] | null
>;

/**
 * GET /api/NearMiss/MonthlyNearMissUsers?year=&month= — same row shape as
 * TopNearMissUsers, scoped to one calendar month.
 */
export type GetMonthlyNearMissUsersResponseDto = GetTopNearMissUsersResponseDto;

/** Matches backend response for GET /api/NearMiss/NearMiss/{id}. */
export type GetNearMissByIdResponseDto =
  ApiEnvelopeDto<CreateNearMissResponseDto | null>;
