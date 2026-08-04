import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

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
