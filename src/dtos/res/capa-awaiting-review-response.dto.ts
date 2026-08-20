import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One row in GET /api/v1/capas/awaiting-effectiveness-review `dataModel.items`. */
export type CapaAwaitingReviewItemDto = {
  id: number;
  title?: string | null;
  capaType?: string | null;
  priority?: string | null;
  assignedId?: number | null;
  assignedName?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
};

/**
 * `dataModel` for GET /api/v1/capas/awaiting-effectiveness-review.
 *
 * `totalPending` is the full server-side count of `Pending Verification` CAPAs —
 * the endpoint does not page, so it always equals `items.length`, but the badge
 * reads the field rather than the array so a future page size cannot desync it.
 */
export type CapaAwaitingReviewDto = {
  totalPending: number;
  items: readonly CapaAwaitingReviewItemDto[];
};

export type GetCapaAwaitingReviewResponseDto =
  ApiEnvelopeDto<CapaAwaitingReviewDto | null>;
