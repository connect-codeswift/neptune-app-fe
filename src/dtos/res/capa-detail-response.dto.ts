import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type { CapaDto } from "@/dtos/res/capa-response.dto";

/**
 * One node of the CAPA lifecycle stepper, as returned by
 * GET /api/v1/capas/{id}/detail. The backend owns the stage list and which node
 * is current — bind the stepper to this, never to a locally invented sequence.
 */
export type CapaLifecycleStageDto = {
  /** Stored status this stage represents, e.g. "Pending Verification". */
  stage: string;
  stageIndex: number;
  isCompleted: boolean;
  isCurrent: boolean;
};

/**
 * `dataModel` for GET /api/v1/capas/{id}/detail, split into the plain CAPA
 * fields (identical to the list/by-id row) and the extras only this endpoint
 * returns.
 *
 * `tasks` is deliberately not carried here: the detail payload's task rows omit
 * `userId`, which `CapaTaskDto` requires, so tasks keep coming from
 * GET /api/v1/capas/{capaId}/tasks.
 */
export type CapaDetailDto = {
  capa: CapaDto;
  lifecycleStages: readonly CapaLifecycleStageDto[];
  totalTasks: number | null;
  completedTasks: number | null;
};

export type GetCapaDetailResponseDto = ApiEnvelopeDto<CapaDetailDto | null>;
