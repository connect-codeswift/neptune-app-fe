import type {
  ChemicalRequestDto,
  ChemicalRiskAssessmentRequestDto,
  HazcomPageQueryDto,
  SafetyDataSheetRequestDto,
  TrainingLogRequestDto,
} from "@/dtos/req/hazcom-request.dto";
import type {
  CreateChemicalResponseDto,
  CreateChemicalRiskAssessmentResponseDto,
  CreateSafetyDataSheetResponseDto,
  CreateTrainingLogResponseDto,
  GetAllChemicalRiskAssessmentsResponseDto,
  GetAllChemicalsResponseDto,
  GetAllSafetyDataSheetsResponseDto,
  GetAllTrainingLogsResponseDto,
  GetChemicalByIdResponseDto,
  GetChemicalNamesResponseDto,
  GetHazardHCodesResponseDto,
  GetPrecautionaryCodesResponseDto,
  GetSdsStatementsResponseDto,
  GetSafetyDataSheetByIdResponseDto,
} from "@/dtos/res/hazcom-response.dto";
import http from "@/lib/axios";

// `http` is configured with a baseURL that already ends in `/api`, so these
// paths drop the `/api` prefix shown in `api/hazcom.md`.
const CHEMICAL_PATH = "/hazcom/chemical";
const CHEMICAL_NAMES_PATH = "/hazcom/chemical/names";
const SDS_PATH = "/hazcom/sds";
const HAZARD_HCODE_PATH = "/hazcom/hazard-hcode";
const PRECAUTIONARY_CODE_PATH = "/hazcom/precautionary-code";
const TRAINING_PATH = "/hazcom/training";
const RISK_ASSESSMENT_PATH = "/hazcom/risk-assessment";

/** Spec defaults for the paged list endpoints. */
const HAZCOM_DEFAULT_PAGE: HazcomPageQueryDto = {
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
/** GET /api/hazcom/chemical/published?pageNumber&pageSize */
/** GET /api/hazcom/chemical/names — lookup list for the chemical pickers. */
export async function getChemicalNames() {
  const { data } =
    await http.get<GetChemicalNamesResponseDto>(CHEMICAL_NAMES_PATH);

  return data;
}

/** GET /api/hazcom/chemical/{id} */
export async function getChemicalById(id: number) {
  const { data } = await http.get<GetChemicalByIdResponseDto>(
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
/** GET /api/hazcom/sds/{id}/statements */
export async function getSdsStatements(id: number) {
  const { data } = await http.get<GetSdsStatementsResponseDto>(
    `${SDS_PATH}/${String(id)}/statements`,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* GHS code libraries                                                         */
/* -------------------------------------------------------------------------- */

/** GET /api/hazcom/hazard-hcode */
export async function getHazardHCodes() {
  const { data } =
    await http.get<GetHazardHCodesResponseDto>(HAZARD_HCODE_PATH);

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
