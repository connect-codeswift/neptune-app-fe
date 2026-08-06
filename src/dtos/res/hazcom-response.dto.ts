/**
 * Response shapes for the HazCom endpoints.
 *
 * Reconciled field-by-field against the backend source (`HazComRepository.cs`,
 * `Neptune.Domain/Entities/HazCom/*.cs`, `ResponseModel.cs`) — Swagger
 * documents every 200 as a bare `{"description": "Success"}` with no schema,
 * so the source is the only contract.
 *
 * Two things drive the shapes below:
 *   - Most GETs return **EF entities serialised raw**, not shaped DTOs, so the
 *     rows carry `subCompId`, `userId` and `isDrop` alongside the useful
 *     fields. A few endpoints project instead, and those are marked.
 *   - `Program.cs` sets no `PropertyNamingPolicy`, so `AddControllers` applies
 *     the default camelCase. That yields the odd `chemi_Name`, `caS_Number`
 *     and `p_Codes` spellings the entities' PascalCase names produce.
 *
 * Rows still go through the mappers in `services/mappers/` rather than being
 * consumed directly, so a backend change degrades to a blank field.
 */

import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Fields every raw HazCom entity carries once serialised. */
type PersistedEntityDto = {
  id: number;
  /** Legacy entity column; prefer `siteId` when present on newer responses. */
  subCompId: number;
  siteId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string | null;
};

/**
 * `ResponseData.SaveResponse("")` — these writes acknowledge only. `dataModel`
 * is the empty string, never the saved row, so a newly created id CANNOT be
 * read back from them.
 */
export type SaveAcknowledgementDto = "";

/** `ResponseData.SaveResponse(new { entity.Id })` — the id and nothing else. */
export type CreatedIdDto = { id: number };

/** `ResponseData.DeleteSuccessResponse(…)` assigns no `DataModel`. */
export type DeleteAcknowledgementDto = null;

/* -------------------------------------------------------------------------- */
/* Chemicals                                                                  */
/* -------------------------------------------------------------------------- */

/** The `Chemical` entity, serialised raw by the chemical list/detail routes. */
export type ChemicalDto = PersistedEntityDto & {
  chemi_Name: string;
  caS_Number: string | null;
  hazardClass: string;
  location: string;
  disposeLocation: string | null;
  currentQuantity: string;
  ghsSignal: string | null;
  linkToSdsRecord: string | null;
  status: string | null;
  ghsPictograms: string | null;
  notes: string | null;
  isDraft: boolean;
  /** Soft delete. Every read already filters `!IsDrop`, so this is always false. */
  isDrop: boolean;
};

/** POST /api/hazcom/chemical — acknowledgement only, no row returned. */
export type CreateChemicalResponseDto = ApiEnvelopeDto<SaveAcknowledgementDto>;

/**
 * GET /api/hazcom/chemical, /chemical/drafts and /chemical/published — all
 * three take `pageNumber`/`pageSize` and return the same row shape.
 */
export type GetAllChemicalsResponseDto = ApiEnvelopeDto<
  PagedDataDto<ChemicalDto>
>;

/** GET /api/hazcom/chemical/{id} — 404s rather than returning null. */
export type GetChemicalByIdResponseDto = ApiEnvelopeDto<ChemicalDto>;

/** DELETE /api/hazcom/chemical/{id} — soft delete, sets `IsDrop`. */
export type DeleteChemicalResponseDto =
  ApiEnvelopeDto<DeleteAcknowledgementDto>;

/**
 * One entry of GET /api/hazcom/chemical/names. Projected, not a raw entity:
 * `new { x.Id, ChemicalName = x.Chemi_Name, x.SubCompId }` — so the name
 * arrives as `chemicalName`, not `chemi_Name`.
 */
export type ChemicalNameDto = {
  id: number;
  chemicalName: string;
  subCompId: number;
};

/** GET /api/hazcom/chemical/names — unpaged lookup list. */
export type GetChemicalNamesResponseDto = ApiEnvelopeDto<ChemicalNameDto[]>;

/* -------------------------------------------------------------------------- */
/* Safety data sheets                                                         */
/* -------------------------------------------------------------------------- */

/** The `SafetyDataSheet` entity, serialised raw by the sds list/detail routes. */
export type SafetyDataSheetDto = PersistedEntityDto & {
  chemicalId: number | null;
  /** Navigation property. Never `Include`d, so it serialises as null. */
  chemical: ChemicalDto | null;
  pdfUrl: string | null;
  productName: string;
  manufacturer: string | null;
  casNumber: string | null;
  hazardClass: string | null;
  disposeLocation: string | null;
  signalWord: string | null;
  revisionDate: string | null;
  version: string | null;
  /** One string, not a list. */
  ghsPictograms: string | null;
  /** One H-code, or several joined with ", ". */
  hazardStatement: string;
  /** One P-code, or several joined with ", ". */
  precautionaryStatement: string;
  isDraft: boolean;
  isDrop: boolean;
};

/** POST /api/hazcom/sds — acknowledgement only, no row returned. */
export type CreateSafetyDataSheetResponseDto =
  ApiEnvelopeDto<SaveAcknowledgementDto>;

/** GET /api/hazcom/sds */
export type GetAllSafetyDataSheetsResponseDto = ApiEnvelopeDto<
  PagedDataDto<SafetyDataSheetDto>
>;

/** GET /api/hazcom/sds/{id} — 404s rather than returning null. */
export type GetSafetyDataSheetByIdResponseDto =
  ApiEnvelopeDto<SafetyDataSheetDto>;

/** DELETE /api/hazcom/sds/{id} — soft delete, sets `IsDrop`. */
export type DeleteSafetyDataSheetResponseDto =
  ApiEnvelopeDto<DeleteAcknowledgementDto>;

/**
 * GET /api/hazcom/sds/{id}/statements.
 *
 * NOT a list of codes — the route projects a single row,
 * `new { x.Id, x.HazardStatement, x.PrecautionaryStatement }`, whose two
 * fields are the same comma-separated strings stored on the sheet.
 */
export type SdsStatementDto = {
  id: number;
  hazardStatement: string;
  precautionaryStatement: string;
};

/** GET /api/hazcom/sds/{id}/statements */
export type GetSdsStatementsResponseDto = ApiEnvelopeDto<SdsStatementDto>;

/**
 * GET /api/hazcom/sds/{id}/label — projected for the GHS label generator.
 * `chemicalName` falls back to the sheet's own `ProductName` when no chemical
 * is linked. Every code field is a string, not an array.
 */
export type SdsLabelDto = {
  sdsId: number;
  chemicalName: string;
  manufacturer: string | null;
  cas: string | null;
  signal: string | null;
  pictograms: string | null;
  hazardCode: string;
  precautionCode: string;
  subCompId: number;
  userId: number;
};

/** GET /api/hazcom/sds/{id}/label */
export type GetSdsLabelResponseDto = ApiEnvelopeDto<SdsLabelDto>;

/* -------------------------------------------------------------------------- */
/* GHS code libraries                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The `Hazard_HCodes` entity — "Dropdown entity, not linked to any table".
 * There is no statement-text column: `codes` is the whole payload.
 */
export type HazardHCodeDto = {
  id: number;
  subCompId: number;
  userId: number;
  codes: string;
};

/** POST /api/hazcom/hazard-hcode — returns the new id only. */
export type CreateHazardHCodeResponseDto = ApiEnvelopeDto<CreatedIdDto>;

/** GET /api/hazcom/hazard-hcode — unpaged lookup list. */
export type GetHazardHCodesResponseDto = ApiEnvelopeDto<HazardHCodeDto[]>;

/**
 * The `PrecautionaryCodes` entity. Note the key is `p_Codes`, not `pCodes` —
 * camelCasing `P_Codes` only lowercases the leading `P`.
 */
export type PrecautionaryCodeDto = {
  id: number;
  subCompId: number;
  userId: number;
  p_Codes: string;
};

/** POST /api/hazcom/precautionary-code — returns the new id only. */
export type CreatePrecautionaryCodeResponseDto = ApiEnvelopeDto<CreatedIdDto>;

/** GET /api/hazcom/precautionary-code — unpaged lookup list. */
export type GetPrecautionaryCodesResponseDto = ApiEnvelopeDto<
  PrecautionaryCodeDto[]
>;

/* -------------------------------------------------------------------------- */
/* Training                                                                   */
/* -------------------------------------------------------------------------- */

export type TrainingMaterialDto = {
  id?: number;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
};

/** The `TrainingLog` entity, serialised raw. Has no `IsDrop` column. */
export type TrainingLogDto = PersistedEntityDto & {
  chemicalId: number | null;
  /** Navigation property. Never `Include`d, so it serialises as null. */
  chemical: ChemicalDto | null;
  sessionDate: string;
  trainer: string;
  trainerTitle: string | null;
  /** Comma-separated chemical names. */
  chemicalsCovered: string | null;
  /** A string column even though the UI collects a head count. */
  attendees: string | null;
  /** Server-derived head count when provided; read-only on responses. */
  attendeesCount?: number | null;
  materials: TrainingMaterialDto[] | null;
  notes: string | null;
  /** Nullable: the create body carries no status, so new rows have none. */
  status: string | null;
};

/** POST /api/hazcom/training — returns the new id only. */
export type CreateTrainingLogResponseDto = ApiEnvelopeDto<CreatedIdDto>;

/** GET /api/hazcom/training */
export type GetAllTrainingLogsResponseDto = ApiEnvelopeDto<
  PagedDataDto<TrainingLogDto>
>;

/** GET /api/hazcom/training/{id} — 404s rather than returning null. */
export type GetTrainingLogByIdResponseDto = ApiEnvelopeDto<TrainingLogDto>;

/** PUT /api/hazcom/training/{id} — acknowledgement only, no row returned. */
export type UpdateTrainingLogResponseDto =
  ApiEnvelopeDto<SaveAcknowledgementDto>;

/* -------------------------------------------------------------------------- */
/* Risk assessments                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A risk assessment row. Projected rather than raw — both the list and the
 * by-id route select the same field set, joining the chemical's name in and
 * leaving `userId` out.
 */
export type ChemicalRiskAssessmentDto = {
  id: number;
  chemicalId: number;
  /** Joined from `Chemical.Chemi_Name` — not present on the write body. */
  chemicalName: string;
  subCompId: number;
  /** The exposure scenario / task description. */
  description: string | null;
  exposureDuration: string | null;
  frequency: string | null;
  hazardHealthRating: number;
  hazardFlammabilityRating: number;
  hazardReactivityRating: number;
  hazardPpeIndexRating: number;
  /** Comma-separated PPE labels. */
  recommendedPpe: string | null;
  notes: string | null;
  /** Documented backend-side as "Low, Medium or High" — no Critical. */
  riskLevel: string | null;
  /** Sum of the four ratings, out of 16. */
  riskScore: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string | null;
};

/** POST /api/hazcom/risk-assessment — returns the new id only. */
export type CreateChemicalRiskAssessmentResponseDto =
  ApiEnvelopeDto<CreatedIdDto>;

/** GET /api/hazcom/risk-assessment */
export type GetAllChemicalRiskAssessmentsResponseDto = ApiEnvelopeDto<
  PagedDataDto<ChemicalRiskAssessmentDto>
>;

/** GET /api/hazcom/risk-assessment/{id} — 404s rather than returning null. */
export type GetChemicalRiskAssessmentByIdResponseDto =
  ApiEnvelopeDto<ChemicalRiskAssessmentDto>;

/** PUT /api/hazcom/risk-assessment/{id} — acknowledgement only. */
export type UpdateChemicalRiskAssessmentResponseDto =
  ApiEnvelopeDto<SaveAcknowledgementDto>;
