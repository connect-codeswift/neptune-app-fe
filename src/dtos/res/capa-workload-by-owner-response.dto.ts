import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One owner row in GET /api/v1/capas/workload-by-owner `dataModel`. */
export type CapaWorkloadOwnerDto = {
  assignedId?: number | null;
  ownerName?: string | null;
  openCount?: number | null;
};

/** dataModel shape for GET /api/v1/capas/workload-by-owner. */
export type CapaWorkloadByOwnerDto = {
  owners?: readonly CapaWorkloadOwnerDto[] | null;
};

export type GetCapaWorkloadByOwnerResponseDto =
  ApiEnvelopeDto<CapaWorkloadByOwnerDto | null>;
