import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** dataModel shape for GET /api/v1/capas/lifecycle. */
export type CapaLifecycleDto = {
  open?: number | null;
  inProgress?: number | null;
  overdue?: number | null;
  verified?: number | null;
  total?: number | null;
};

export type GetCapaLifecycleResponseDto =
  ApiEnvelopeDto<CapaLifecycleDto | null>;
