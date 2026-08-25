import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/**
 * dataModel shape for GET /api/v1/capas/lifecycle.
 *
 * Active CAPAs by stage: `total` counts everything that is not Closed, so there is no
 * `closed` field and there never was a `verified` one - Closed *is* verified.
 * `overdue` overlaps the stages rather than being one of them.
 */
export type CapaLifecycleDto = {
  open?: number | null;
  inProgress?: number | null;
  completed?: number | null;
  pendingVerification?: number | null;
  overdue?: number | null;
  total?: number | null;
};

export type GetCapaLifecycleResponseDto =
  ApiEnvelopeDto<CapaLifecycleDto | null>;
