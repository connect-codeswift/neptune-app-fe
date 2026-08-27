import type { CreateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Created hazard record returned by POST /api/v1/hazards. */
export type CreateHazardResponseDto = ApiEnvelopeDto<CreateHazardRequestDto>;

/** A hazard row as returned by the list endpoint. */
export type HazardDto = CreateHazardRequestDto & {
  id: number;
  status: string;
  createdDate: string;
  updatedAt: string | null;
  /** Who closed it and when; both null while it is open. */
  closedById: number | null;
  closedAt: string | null;
};

/** Matches backend response for POST /api/v1/hazards/search. */
export type GetAllHazardResponseDto = ApiEnvelopeDto<PagedDataDto<HazardDto>>;

/** Matches backend response for GET /api/v1/hazards/{id}. */
export type GetHazardByIdResponseDto = ApiEnvelopeDto<HazardDto | null>;

/**
 * KPI counters from GET /api/v1/hazards/kpis.
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

/** Matches backend response for GET /api/v1/hazards/kpis. */
export type GetHazardKpiResponseDto = ApiEnvelopeDto<HazardKpiDto | null>;

/** One cell of GET /api/v1/hazards/heatmap — a location/type tally. */
export type HazardHeatMapCellDto = {
  location: string;
  type: string;
  count: number;
};

/** Matches backend response for GET /api/v1/hazards/heatmap. */
export type GetHazardHeatMapResponseDto = ApiEnvelopeDto<
  HazardHeatMapCellDto[] | null
>;

/** One row of GET /api/v1/hazards/recognitions. */
export type HazardRecognitionDto = {
  userId: number;
  userName: string;
  hazardCount: number;
};

/**
 * Matches backend response for
 * GET /api/v1/hazards/recognitions?year=&month=&limit= — the Recognition card's
 * top reporters for one calendar month. Renamed from `monthly-users`; the two
 * `top-users` routes it used to share a shape with are gone.
 */
export type GetHazardRecognitionsResponseDto = ApiEnvelopeDto<
  HazardRecognitionDto[] | null
>;
