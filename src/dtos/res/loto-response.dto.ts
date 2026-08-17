import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/**
 * Response DTOs for the LOTO module — `api/Loto`. Contract: FEGuides/Loto.md.
 * Shapes below are the normalized camelCase forms; the service coerces the
 * backend's inconsistent casing before anything else sees the row.
 */

export type LotoEquipmentStatusDto = "Operational" | "Locked Out" | "Maintenance";

/** One row of POST /api/Loto/GetAllEquipment. `energySources` is comma-separated. */
export type LotoEquipmentGridRowDto = {
  id: number;
  /** Raw per-site sequence, e.g. "7" — draw with the `EQ-` prefix. */
  equipmentCode: string;
  name: string;
  location: string;
  energySources: string;
  lastInspectionAt: string | null;
  status: LotoEquipmentStatusDto;
};

export type LotoEquipmentStepDto = {
  description: string;
  isolationPoint: string | null;
  energyType: string | null;
  lockTagPosition: string | null;
};

export type LotoAuthorizedPersonDto = {
  userId: number;
  fullName: string;
};

/** GET /api/Loto/equipment/{id} — the grid row plus procedure and authorization detail. */
export type LotoEquipmentDetailDto = LotoEquipmentGridRowDto & {
  locationId: number;
  description: string | null;
  hazardLevel: string | null;
  isOutOfService: boolean;
  additionalNotes: string | null;
  steps: LotoEquipmentStepDto[];
  authorizedPersonnel: LotoAuthorizedPersonDto[];
  canApply: boolean;
  cannotApplyReason: string | null;
};

/** GET /api/Loto/locations row. */
export type LotoLocationDto = {
  id: number;
  name: string;
};

export type LotoLockoutStatusDto = "Active" | "Completed";

/**
 * One lockout row — shared by GET /api/Loto/active-lockouts,
 * POST /api/Loto/GetAllLockouts and GET /api/Loto/equipment/{id}/history.
 */
export type LotoLockoutRowDto = {
  id: number;
  logCode: string;
  lotoEquipmentId: number;
  equipmentName: string;
  operatorName: string;
  /** Raw per-site sequence, e.g. "12" — draw with the `LK-` prefix. */
  lockNumber: string;
  purpose: string;
  startedAt: string;
  expectedCompletionAt: string | null;
  removedAt: string | null;
  status: LotoLockoutStatusDto;
  /** True only for the operator who applied the lock. */
  canRemove: boolean;
};

/** GET /api/Loto/personnel row. `equipment` holds raw machine codes. */
export type LotoPersonnelDto = {
  userId: number;
  fullName: string;
  certifiedAt: string | null;
  expiresAt: string | null;
  status: "Current" | "Expired";
  equipment: string[];
};

/** GET /api/Loto/dashboard-kpis. */
export type LotoDashboardKpisDto = {
  equipmentOnFile: number;
  activeLockouts: number;
  authorizedPersonnel: number;
  availableEquipment: number;
};

/** POST /api/Loto/equipment dataModel — the generated code feeds the success toast. */
export type CreateLotoEquipmentResultDto = {
  id: number;
  equipmentCode: string;
};

/** POST /api/Loto/lockouts dataModel. */
export type ApplyLotoLockoutResultDto = {
  id: number;
  logCode: string;
  lockNumber: string;
};

export type GetLotoEquipmentResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoEquipmentDetailResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoLocationsResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoActiveLockoutsResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoLockoutsResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoEquipmentHistoryResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoPersonnelResponseDto = ApiEnvelopeDto<unknown>;
export type GetLotoDashboardKpisResponseDto = ApiEnvelopeDto<unknown>;
export type CreateLotoEquipmentResponseDto = ApiEnvelopeDto<unknown>;
export type ApplyLotoLockoutResponseDto = ApiEnvelopeDto<unknown>;
export type RemoveLotoLockoutResponseDto = ApiEnvelopeDto<unknown>;
