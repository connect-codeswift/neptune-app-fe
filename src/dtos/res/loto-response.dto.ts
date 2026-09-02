import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/**
 * Response DTOs for the LOTO module — `api/Loto`. Contract: FEGuides/Loto.md.
 * Shapes below are the normalized camelCase forms; the service coerces the
 * backend's inconsistent casing before anything else sees the row.
 */

export type LotoEquipmentStatusDto =
  "Operational" | "Locked Out" | "Maintenance";

/** One row of POST /api/v1/loto/equipment/search. `energySources` is comma-separated. */
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

/**
 * Why a lockout cannot be applied. "Unauthorized" is a fact about the caller —
 * the control is not theirs to use — while the rest are facts about the machine
 * that an authorized operator still needs to read.
 */
export type LotoApplyBlockKindDto =
  "Unauthorized" | "CertificationExpired" | "AlreadyLockedOut" | "OutOfService";

export type LotoEquipmentStepDto = {
  description: string;
  isolationPoint: string | null;
  energyType: string | null;
  isolationMethod: string | null;
  lockTagPosition: string | null;
};

export type LotoAuthorizedPersonDto = {
  userId: number;
  fullName: string;
};

/** GET /api/v1/loto/equipment/{id} — the grid row plus procedure and authorization detail. */
export type LotoEquipmentDetailDto = LotoEquipmentGridRowDto & {
  locationId: number;
  description: string | null;
  hazardLevel: string | null;
  isOutOfService: boolean;
  verificationMethod: string | null;
  additionalNotes: string | null;
  steps: LotoEquipmentStepDto[];
  authorizedPersonnel: LotoAuthorizedPersonDto[];
  canApply: boolean;
  cannotApplyReason: string | null;
  cannotApplyKind: LotoApplyBlockKindDto | null;
};

/** GET /api/v1/locations row. */
export type LotoLocationDto = {
  id: number;
  name: string;
};

export type LotoLockoutStatusDto = "Active" | "Completed";

/**
 * One lockout row — shared by GET /api/v1/loto/lockouts?status=active,
 * POST /api/v1/loto/lockouts/search and GET /api/v1/loto/equipment/{id}/history.
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
  /** The lock-and-tag photo taken on apply, as a files-API id. Null when none. */
  attachmentFileId: string | null;
  /** True only for the operator who applied the lock. */
  canRemove: boolean;
};

/**
 * What a pair of certification dates earns. "Not certified" is its own state: it used to fall
 * through to Current, so someone with no training read as green on the register.
 */
export type LotoCertificationStatus =
  "Not certified" | "Current" | "Expiring" | "Expired";

/** GET /api/v1/loto/personnel row. `equipment` holds raw machine codes. */
export type LotoPersonnelDto = {
  userId: number;
  fullName: string;
  certifiedAt: string | null;
  expiresAt: string | null;
  /** The certificate on file, as a files-API id. Never a url. */
  attachmentFileId: string | null;
  /** Derived from the dates by the API — never stored, so it cannot go stale. */
  status: LotoCertificationStatus;
  equipment: string[];
};

/** GET /api/v1/loto/dashboard-kpis. */
export type LotoDashboardKpisDto = {
  equipmentOnFile: number;
  activeLockouts: number;
  authorizedPersonnel: number;
  availableEquipment: number;
};

/** POST /api/v1/loto/equipment dataModel — the generated code feeds the success toast. */
export type CreateLotoEquipmentResultDto = {
  id: number;
  equipmentCode: string;
};

/** POST /api/v1/loto/lockouts dataModel. */
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
