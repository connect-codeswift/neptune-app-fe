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

/** POST /api/Loto/GetAllEquipment body. */
export type GetAllLotoEquipmentRequestDto = {
  pageNumber: number;
  pageSize: number;
  search: string;
  status: LotoEquipmentStatusFilterDto;
};

export type LotoLockoutStatusFilterDto = "All" | "Active" | "Completed";

/** POST /api/Loto/GetAllLockouts body. */
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
  lockTagPosition: string | null;
};

export type LotoHazardLevelDto = "Low" | "Medium" | "High";

/** POST /api/Loto/equipment and PUT /api/Loto/equipment/{id} body. */
export type UpsertLotoEquipmentRequestDto = {
  name: string;
  locationId: number;
  description: string | null;
  hazardLevel: LotoHazardLevelDto | null;
  isOutOfService: boolean;
  lastInspectionAt: string | null;
  additionalNotes: string | null;
  steps: LotoProcedureStepRequestDto[];
  authorizedUserIds: number[];
};

/** POST /api/Loto/lockouts body. The backend assigns the lock number. */
export type ApplyLotoLockoutRequestDto = {
  lotoEquipmentId: number;
  purpose: string;
  expectedCompletionAt: string | null;
  confirmationAccepted: boolean;
};

/** POST /api/Loto/lockouts/{id}/remove body. Both flags are required. */
export type RemoveLotoLockoutRequestDto = {
  energyRestoredConfirmed: boolean;
  signedOff: boolean;
};
