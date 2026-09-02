/**
 * Request DTOs for the LOTO (lockout-tagout) module — `api/Loto`.
 * Contract: FEGuides/Loto.md in Neptune-Ehss-BE.
 *
 * Equipment codes and lock numbers are backend-assigned per-site sequences and
 * never appear in a payload; the frontend draws them with `EQ-` / `LK-`
 * prefixes for display only.
 */

export type LotoEquipmentStatusFilterDto =
  "All" | "Operational" | "Locked Out" | "Maintenance";

/** POST /api/v1/loto/equipment/search body. */
export type GetAllLotoEquipmentRequestDto = {
  pageNumber: number;
  pageSize: number;
  search: string;
  status: LotoEquipmentStatusFilterDto;
};

export type LotoLockoutStatusFilterDto = "All" | "Active" | "Completed";

/** POST /api/v1/loto/lockouts/search body. */
export type GetAllLotoLockoutsRequestDto = {
  pageNumber: number;
  pageSize: number;
  search: string;
  status: LotoLockoutStatusFilterDto;
};

export type LotoProcedureStepRequestDto = {
  description: string;
  isolationPoint: string | null;
  energyType: string | null;
  isolationMethod: string | null;
  lockTagPosition: string | null;
};

export type LotoHazardLevelDto = "Low" | "Medium" | "High";

/** POST /api/v1/loto/equipment and PUT /api/v1/loto/equipment/{id} body. */
export type UpsertLotoEquipmentRequestDto = {
  name: string;
  locationId: number;
  description: string | null;
  hazardLevel: LotoHazardLevelDto | null;
  isOutOfService: boolean;
  /** How to confirm zero energy. Optional, like the notes beside it. */
  verificationMethod: string | null;
  additionalNotes: string | null;
  steps: LotoProcedureStepRequestDto[];
  authorizedUserIds: number[];
};

/** POST /api/v1/loto/lockouts body. The backend assigns the lock number. */
export type ApplyLotoLockoutRequestDto = {
  lotoEquipmentId: number;
  purpose: string;
  expectedCompletionAt: string | null;
  confirmationAccepted: boolean;
  /** Optional photo of the applied lock and tag. A files-API id, never a url. */
  attachmentFileId: string | null;
};

/** POST /api/v1/loto/lockouts/{id}/remove body. Both flags are required. */
/**
 * PUT /api/v1/loto/personnel/certification.
 *
 * Per person, not per machine — the API keys on userId alone, so saving from a procedure editor
 * still writes one global record covering every machine they are authorized on.
 */
export type SaveLotoCertificationRequestDto = {
  userId: number;
  certifiedAt: string | null;
  expiresAt: string | null;
  /** A files-API id from the three-step upload. Never a url — the bucket is private. */
  attachmentFileId: string | null;
};

export type RemoveLotoLockoutRequestDto = {
  energyRestoredConfirmed: boolean;
  signedOff: boolean;
};
