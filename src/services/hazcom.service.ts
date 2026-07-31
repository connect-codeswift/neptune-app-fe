import type {
  ChemicalRequestDto,
  ChemicalRiskAssessmentRequestDto,
  HazardHCodeRequestDto,
  HazcomPageQueryDto,
  PrecautionaryCodeRequestDto,
  SafetyDataSheetRequestDto,
  TrainingLogRequestDto,
  UpdateTrainingLogRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import type {
  CreateChemicalResponseDto,
  CreateChemicalRiskAssessmentResponseDto,
  CreateHazardHCodeResponseDto,
  CreatePrecautionaryCodeResponseDto,
  CreateSafetyDataSheetResponseDto,
  CreateTrainingLogResponseDto,
  DeleteChemicalResponseDto,
  DeleteSafetyDataSheetResponseDto,
  GetAllChemicalRiskAssessmentsResponseDto,
  GetAllChemicalsResponseDto,
  GetAllSafetyDataSheetsResponseDto,
  GetAllTrainingLogsResponseDto,
  GetChemicalByIdResponseDto,
  GetChemicalNamesResponseDto,
  GetChemicalRiskAssessmentByIdResponseDto,
  GetHazardHCodesResponseDto,
  GetPrecautionaryCodesResponseDto,
  GetSdsLabelResponseDto,
  GetSdsStatementsResponseDto,
  GetSafetyDataSheetByIdResponseDto,
  GetTrainingLogByIdResponseDto,
  UpdateChemicalRiskAssessmentResponseDto,
  UpdateTrainingLogResponseDto,
} from "@/dtos/res/hazcom-response.dto";
import http from "@/lib/axios";

// `http` is configured with a baseURL that already ends in `/api`, so these
// paths drop the `/api` prefix shown in `api/hazcom.md`.
const CHEMICAL_PATH = "/hazcom/chemical";
const CHEMICAL_DRAFTS_PATH = "/hazcom/chemical/drafts";
const CHEMICAL_PUBLISHED_PATH = "/hazcom/chemical/published";
const CHEMICAL_NAMES_PATH = "/hazcom/chemical/names";
const SDS_PATH = "/hazcom/sds";
const HAZARD_HCODE_PATH = "/hazcom/hazard-hcode";
const PRECAUTIONARY_CODE_PATH = "/hazcom/precautionary-code";
const TRAINING_PATH = "/hazcom/training";
const RISK_ASSESSMENT_PATH = "/hazcom/risk-assessment";

/** Spec defaults for the paged list endpoints. */
export const HAZCOM_DEFAULT_PAGE: HazcomPageQueryDto = {
  pageNumber: 1,
  pageSize: 10,
};

/* -------------------------------------------------------------------------- */
/* Chemicals                                                                  */
/* -------------------------------------------------------------------------- */

/** POST /api/hazcom/chemical */
export async function createChemical(payload: ChemicalRequestDto) {
  const { data } = await http.post<CreateChemicalResponseDto>(
    CHEMICAL_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/chemical?pageNumber&pageSize */
export async function getAllChemicals(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalsResponseDto>(CHEMICAL_PATH, {
    params: query,
  });

  return data;
}

/** GET /api/hazcom/chemical/drafts?pageNumber&pageSize */
export async function getDraftChemicals(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalsResponseDto>(
    CHEMICAL_DRAFTS_PATH,
    { params: query },
  );

  return data;
}

/** GET /api/hazcom/chemical/published?pageNumber&pageSize */
export async function getPublishedChemicals(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalsResponseDto>(
    CHEMICAL_PUBLISHED_PATH,
    { params: query },
  );

  return data;
}

/** GET /api/hazcom/chemical/names — lookup list for the chemical pickers. */
export async function getChemicalNames() {
  const { data } = await http.get<GetChemicalNamesResponseDto>(
    CHEMICAL_NAMES_PATH,
  );

  return data;
}

/** GET /api/hazcom/chemical/{id} */
export async function getChemicalById(id: number) {
  const { data } = await http.get<GetChemicalByIdResponseDto>(
    `${CHEMICAL_PATH}/${String(id)}`,
  );

  return data;
}

/** DELETE /api/hazcom/chemical/{id} */
export async function deleteChemical(id: number) {
  const { data } = await http.delete<DeleteChemicalResponseDto>(
    `${CHEMICAL_PATH}/${String(id)}`,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Safety data sheets                                                         */
/* -------------------------------------------------------------------------- */

/** POST /api/hazcom/sds */
export async function createSafetyDataSheet(
  payload: SafetyDataSheetRequestDto,
) {
  const { data } = await http.post<CreateSafetyDataSheetResponseDto>(
    SDS_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/sds?pageNumber&pageSize */
export async function getAllSafetyDataSheets(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllSafetyDataSheetsResponseDto>(SDS_PATH, {
    params: query,
  });

  return data;
}

/** GET /api/hazcom/sds/{id} */
export async function getSafetyDataSheetById(id: number) {
  const { data } = await http.get<GetSafetyDataSheetByIdResponseDto>(
    `${SDS_PATH}/${String(id)}`,
  );

  return data;
}

/** DELETE /api/hazcom/sds/{id} */
export async function deleteSafetyDataSheet(id: number) {
  const { data } = await http.delete<DeleteSafetyDataSheetResponseDto>(
    `${SDS_PATH}/${String(id)}`,
  );

  return data;
}

/** GET /api/hazcom/sds/{id}/statements */
export async function getSdsStatements(id: number) {
  const { data } = await http.get<GetSdsStatementsResponseDto>(
    `${SDS_PATH}/${String(id)}/statements`,
  );

  return data;
}

/** GET /api/hazcom/sds/{id}/label */
export async function getSdsLabel(id: number) {
  const { data } = await http.get<GetSdsLabelResponseDto>(
    `${SDS_PATH}/${String(id)}/label`,
  );

  return data;
}

/**
 * GET /api/hazcom/sds/{id}/statements/pdf
 *
 * The spec documents no content type for this one; the `/pdf` suffix implies a
 * binary body, so it is requested as a Blob rather than JSON. If the backend
 * actually returns a URL in the usual envelope, drop the `responseType`.
 */
export async function getSdsStatementsPdf(id: number) {
  const { data } = await http.get<Blob>(
    `${SDS_PATH}/${String(id)}/statements/pdf`,
    { responseType: "blob" },
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* GHS code libraries                                                         */
/* -------------------------------------------------------------------------- */

/** POST /api/hazcom/hazard-hcode */
export async function createHazardHCode(payload: HazardHCodeRequestDto) {
  const { data } = await http.post<CreateHazardHCodeResponseDto>(
    HAZARD_HCODE_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/hazard-hcode */
export async function getHazardHCodes() {
  const { data } =
    await http.get<GetHazardHCodesResponseDto>(HAZARD_HCODE_PATH);

  return data;
}

/** POST /api/hazcom/precautionary-code */
export async function createPrecautionaryCode(
  payload: PrecautionaryCodeRequestDto,
) {
  const { data } = await http.post<CreatePrecautionaryCodeResponseDto>(
    PRECAUTIONARY_CODE_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/precautionary-code */
export async function getPrecautionaryCodes() {
  const { data } = await http.get<GetPrecautionaryCodesResponseDto>(
    PRECAUTIONARY_CODE_PATH,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Training                                                                   */
/* -------------------------------------------------------------------------- */

/** POST /api/hazcom/training */
export async function createTrainingLog(payload: TrainingLogRequestDto) {
  const { data } = await http.post<CreateTrainingLogResponseDto>(
    TRAINING_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/training?pageNumber&pageSize */
export async function getAllTrainingLogs(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllTrainingLogsResponseDto>(
    TRAINING_PATH,
    { params: query },
  );

  return data;
}

/** GET /api/hazcom/training/{id} */
export async function getTrainingLogById(id: number) {
  const { data } = await http.get<GetTrainingLogByIdResponseDto>(
    `${TRAINING_PATH}/${String(id)}`,
  );

  return data;
}

/** PUT /api/hazcom/training/{id} */
export async function updateTrainingLog(
  id: number,
  payload: UpdateTrainingLogRequestDto,
) {
  const { data } = await http.put<UpdateTrainingLogResponseDto>(
    `${TRAINING_PATH}/${String(id)}`,
    payload,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Risk assessments                                                           */
/* -------------------------------------------------------------------------- */

/** POST /api/hazcom/risk-assessment */
export async function createChemicalRiskAssessment(
  payload: ChemicalRiskAssessmentRequestDto,
) {
  const { data } = await http.post<CreateChemicalRiskAssessmentResponseDto>(
    RISK_ASSESSMENT_PATH,
    payload,
  );

  return data;
}

/** GET /api/hazcom/risk-assessment?pageNumber&pageSize */
export async function getAllChemicalRiskAssessments(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalRiskAssessmentsResponseDto>(
    RISK_ASSESSMENT_PATH,
    { params: query },
  );

  return data;
}

/** GET /api/hazcom/risk-assessment/{id} */
export async function getChemicalRiskAssessmentById(id: number) {
  const { data } = await http.get<GetChemicalRiskAssessmentByIdResponseDto>(
    `${RISK_ASSESSMENT_PATH}/${String(id)}`,
  );

  return data;
}

/** PUT /api/hazcom/risk-assessment/{id} */
export async function updateChemicalRiskAssessment(
  id: number,
  payload: ChemicalRiskAssessmentRequestDto,
) {
  const { data } = await http.put<UpdateChemicalRiskAssessmentResponseDto>(
    `${RISK_ASSESSMENT_PATH}/${String(id)}`,
    payload,
  );

  return data;
}
