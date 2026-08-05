import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** One row from GET /api/bbs/behavior-categories. */
export type BehaviorCategoryDto = {
  id?: number;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
  subCompanyId?: number;
  createdAt?: string;
};

/** Matches backend response for GET /api/bbs/behavior-categories. */
export type GetBehaviorCategoriesResponseDto = ApiEnvelopeDto<
  BehaviorCategoryDto[] | null
>;

/** Matches backend response for POST /api/bbs. */
export type CreateBbsObservationResponseDto = ApiEnvelopeDto<unknown>;

/** Matches backend response for PUT /api/bbs/{id}. */
export type UpdateBbsObservationResponseDto = ApiEnvelopeDto<unknown>;

/** One observation row from GET /api/bbs. */
export type BbsObservationDto = {
  id: number;
  observe: string;
  behaviorCategoryId: number;
  categoryName: string;
  location: string;
  description: string;
  photoUrl: string;
  userId: number;
  userName: string;
  createdAt: string;
};

/** Matches backend response for GET /api/bbs. */
export type GetBbsObservationsResponseDto = ApiEnvelopeDto<
  PagedDataDto<BbsObservationDto> | BbsObservationDto[] | null
>;

/** Matches backend response for GET /api/bbs/{id}. */
export type GetBbsObservationByIdResponseDto = ApiEnvelopeDto<
  BbsObservationDto | null
>;

/** dataModel shape for GET /api/bbs/dashboard-kpi. */
export type BbsDashboardKpiDto = {
  totalBbsCount: number;
  safeBehaviourCount: number;
  atRiskCount: number;
};

/** Matches backend response for GET /api/bbs/dashboard-kpi. */
export type GetBbsDashboardKpiResponseDto = ApiEnvelopeDto<
  BbsDashboardKpiDto | null
>;

/** One category count from GET /api/bbs/at-risk-categories. */
export type BbsAtRiskCategoryDto = {
  categoryId: number;
  categoryName: string;
  count: number;
};

/** dataModel shape for GET /api/bbs/at-risk-categories. */
export type BbsAtRiskCategoriesDto = {
  categories: BbsAtRiskCategoryDto[];
  totalAtRisk: number;
};

/** Matches backend response for GET /api/bbs/at-risk-categories. */
export type GetBbsAtRiskCategoriesResponseDto = ApiEnvelopeDto<
  BbsAtRiskCategoriesDto | null
>;

/** One week bucket from GET /api/bbs/graph. */
export type BbsGraphPointDto = {
  weekStart: string;
  safe: number;
  atRisk: number;
};

/** dataModel shape for GET /api/bbs/graph. */
export type BbsGraphDto = {
  graph: BbsGraphPointDto[];
};

/** Matches backend response for GET /api/bbs/graph. */
export type GetBbsGraphResponseDto = ApiEnvelopeDto<BbsGraphDto | null>;
