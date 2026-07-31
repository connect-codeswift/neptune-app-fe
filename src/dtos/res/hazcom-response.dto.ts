/**
 * Response shapes for the HazCom endpoints in `api/hazcom.md`.
 *
 * IMPORTANT — every operation in that file documents its 200 as bare
 * `{"description": "Success"}` with no schema, and the `#/components/schemas`
 * section was not included. The payloads below assume the same envelope the
 * rest of the app receives (`ApiEnvelopeDto` / `PagedDataDto`) and extend the
 * request DTOs with the usual server-assigned fields. Verify against a real
 * response before wiring anything up.
 */

import type {
  ChemicalRequestDto,
  ChemicalRiskAssessmentRequestDto,
  HazardHCodeRequestDto,
  PrecautionaryCodeRequestDto,
  SafetyDataSheetRequestDto,
  TrainingLogRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Server-assigned fields present on every persisted HazCom record. */
type PersistedRecordDto = {
  id: number;
  createdDate: string;
  updatedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/* Chemicals                                                                  */
/* -------------------------------------------------------------------------- */

/** A chemical row as returned by the chemical list/detail endpoints. */
export type ChemicalDto = ChemicalRequestDto & PersistedRecordDto;

/** POST /api/hazcom/chemical */
export type CreateChemicalResponseDto = ApiEnvelopeDto<ChemicalDto | null>;

/**
 * GET /api/hazcom/chemical, /chemical/drafts and /chemical/published —
 * all three take `pageNumber`/`pageSize` and return the same row shape.
 */
export type GetAllChemicalsResponseDto = ApiEnvelopeDto<
  PagedDataDto<ChemicalDto>
>;

/** GET /api/hazcom/chemical/{id} */
export type GetChemicalByIdResponseDto = ApiEnvelopeDto<ChemicalDto | null>;

/** DELETE /api/hazcom/chemical/{id} */
export type DeleteChemicalResponseDto = ApiEnvelopeDto<boolean | null>;

/**
 * One entry of GET /api/hazcom/chemical/names — a lookup list for the
 * chemical pickers. Unpaged, so the payload is a plain array.
 */
export type ChemicalNameDto = {
  id: number;
  name: string;
};

/** GET /api/hazcom/chemical/names */
export type GetChemicalNamesResponseDto = ApiEnvelopeDto<
  ChemicalNameDto[] | null
>;

/* -------------------------------------------------------------------------- */
/* Safety data sheets                                                         */
/* -------------------------------------------------------------------------- */

/** An SDS row as returned by the sds list/detail endpoints. */
export type SafetyDataSheetDto = SafetyDataSheetRequestDto &
  PersistedRecordDto;

/** POST /api/hazcom/sds */
export type CreateSafetyDataSheetResponseDto =
  ApiEnvelopeDto<SafetyDataSheetDto | null>;

/** GET /api/hazcom/sds */
export type GetAllSafetyDataSheetsResponseDto = ApiEnvelopeDto<
  PagedDataDto<SafetyDataSheetDto>
>;

/** GET /api/hazcom/sds/{id} */
export type GetSafetyDataSheetByIdResponseDto =
  ApiEnvelopeDto<SafetyDataSheetDto | null>;

/** DELETE /api/hazcom/sds/{id} */
export type DeleteSafetyDataSheetResponseDto = ApiEnvelopeDto<boolean | null>;

/** A resolved GHS statement attached to a sheet. */
export type SdsStatementDto = {
  id: number;
  /** "H314" / "P260" */
  code: string;
  statement: string;
  /** Which list the code came from. */
  kind: "Hazard" | "Precautionary";
};

/** GET /api/hazcom/sds/{id}/statements */
export type GetSdsStatementsResponseDto = ApiEnvelopeDto<
  SdsStatementDto[] | null
>;

/**
 * GET /api/hazcom/sds/{id}/label — the data the GHS label generator prints.
 */
export type SdsLabelDto = {
  chemicalName: string;
  manufacturer: string;
  casNumber: string;
  signalWord: string;
  pictograms: string[];
  hazardStatements: string[];
  precautionaryStatements: string[];
};

/** GET /api/hazcom/sds/{id}/label */
export type GetSdsLabelResponseDto = ApiEnvelopeDto<SdsLabelDto | null>;

/* -------------------------------------------------------------------------- */
/* GHS code libraries                                                         */
/* -------------------------------------------------------------------------- */

/** A hazard (H-code) row. */
export type HazardHCodeDto = HazardHCodeRequestDto & { id: number };

/** POST /api/hazcom/hazard-hcode */
export type CreateHazardHCodeResponseDto = ApiEnvelopeDto<HazardHCodeDto | null>;

/** GET /api/hazcom/hazard-hcode — unpaged lookup list. */
export type GetHazardHCodesResponseDto = ApiEnvelopeDto<HazardHCodeDto[] | null>;

/** A precautionary (P-code) row. */
export type PrecautionaryCodeDto = PrecautionaryCodeRequestDto & { id: number };

/** POST /api/hazcom/precautionary-code */
export type CreatePrecautionaryCodeResponseDto =
  ApiEnvelopeDto<PrecautionaryCodeDto | null>;

/** GET /api/hazcom/precautionary-code — unpaged lookup list. */
export type GetPrecautionaryCodesResponseDto = ApiEnvelopeDto<
  PrecautionaryCodeDto[] | null
>;

/* -------------------------------------------------------------------------- */
/* Training                                                                   */
/* -------------------------------------------------------------------------- */

/** A training log row as returned by the training endpoints. */
export type TrainingLogDto = TrainingLogRequestDto & PersistedRecordDto;

/** POST /api/hazcom/training */
export type CreateTrainingLogResponseDto = ApiEnvelopeDto<TrainingLogDto | null>;

/** GET /api/hazcom/training */
export type GetAllTrainingLogsResponseDto = ApiEnvelopeDto<
  PagedDataDto<TrainingLogDto>
>;

/** GET /api/hazcom/training/{id} */
export type GetTrainingLogByIdResponseDto =
  ApiEnvelopeDto<TrainingLogDto | null>;

/** PUT /api/hazcom/training/{id} */
export type UpdateTrainingLogResponseDto =
  ApiEnvelopeDto<TrainingLogDto | null>;

/* -------------------------------------------------------------------------- */
/* Risk assessments                                                           */
/* -------------------------------------------------------------------------- */

/** A risk assessment row as returned by the risk-assessment endpoints. */
export type ChemicalRiskAssessmentDto = ChemicalRiskAssessmentRequestDto &
  PersistedRecordDto;

/** POST /api/hazcom/risk-assessment */
export type CreateChemicalRiskAssessmentResponseDto =
  ApiEnvelopeDto<ChemicalRiskAssessmentDto | null>;

/** GET /api/hazcom/risk-assessment */
export type GetAllChemicalRiskAssessmentsResponseDto = ApiEnvelopeDto<
  PagedDataDto<ChemicalRiskAssessmentDto>
>;

/** GET /api/hazcom/risk-assessment/{id} */
export type GetChemicalRiskAssessmentByIdResponseDto =
  ApiEnvelopeDto<ChemicalRiskAssessmentDto | null>;

/** PUT /api/hazcom/risk-assessment/{id} */
export type UpdateChemicalRiskAssessmentResponseDto =
  ApiEnvelopeDto<ChemicalRiskAssessmentDto | null>;
