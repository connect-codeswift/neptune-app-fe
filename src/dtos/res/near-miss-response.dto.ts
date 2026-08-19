import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Created near-miss record returned by POST /api/v1/near-misses. */
export type CreateNearMissResponseDto = CreateNearMissRequestDto & {
  /** Server-side creation timestamp; drives the table's Age column. */
  createdAt?: string;
  /** "Open" | "Investigating" | "Closed"; null on records created before it existed. */
  status?: string | null;
};

/** Matches backend response for POST /api/v1/near-misses/search. */
export type GetAllNearMissResponseDto = ApiEnvelopeDto<
  PagedDataDto<CreateNearMissResponseDto>
>;

/**
 * KPI counters from GET /api/v1/near-misses/kpis. Key names aren't pinned
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

/** Matches backend response for GET /api/v1/near-misses/kpis. */
export type GetNearMissKpiResponseDto = ApiEnvelopeDto<NearMissKpiDto | null>;

/** One cell of GET /api/v1/near-misses/heatmap — a location/type tally. */
export type NearMissHeatMapCellDto = {
  location: string;
  /** Present when the backend groups by department instead of (or as well as) location. */
  department?: string;
  type: string;
  count: number;
};

/** Matches backend response for GET /api/v1/near-misses/heatmap. */
export type GetNearMissHeatMapResponseDto = ApiEnvelopeDto<
  NearMissHeatMapCellDto[] | null
>;

/** One row of GET /api/v1/near-misses/recognitions. */
export type NearMissRecognitionDto = {
  userId: number;
  userName: string;
  nearMissCount: number;
};

/**
 * Matches backend response for
 * GET /api/v1/near-misses/recognitions?year=&month=&limit= — the Recognition
 * card's top reporters for one calendar month. Renamed from `monthly-users`;
 * the two `top-users` routes it used to share a shape with are gone.
 */
export type GetNearMissRecognitionsResponseDto = ApiEnvelopeDto<
  NearMissRecognitionDto[] | null
>;

/** Matches backend response for GET /api/v1/near-misses/{id}. */
export type GetNearMissByIdResponseDto =
  ApiEnvelopeDto<CreateNearMissResponseDto | null>;
