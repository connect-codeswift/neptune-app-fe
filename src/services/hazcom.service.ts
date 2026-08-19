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
  GetHazcomTrainingComplianceResponseDto,
  GetHazcomUpcomingDeadlinesResponseDto,
  GetPrecautionaryCodesResponseDto,
  GetSdsStatementsResponseDto,
  GetSafetyDataSheetByIdResponseDto,
} from "@/dtos/res/hazcom-response.dto";
import http from "@/lib/axios";

// `http` is configured with a baseURL that already ends in `/api/v1`, so these
// paths carry neither the `/api` nor the `/v1` prefix.
const CHEMICAL_PATH = "/hazcom/chemicals";
const CHEMICAL_NAMES_PATH = "/hazcom/chemicals/names";
const SDS_PATH = "/hazcom/sds";
const HAZARD_CODE_PATH = "/hazcom/hazard-codes";
const PRECAUTIONARY_CODE_PATH = "/hazcom/precautionary-codes";
const TRAINING_PATH = "/hazcom/trainings";
const RISK_ASSESSMENT_PATH = "/hazcom/risk-assessments";
// The `/hazcom/dashboard/*` sub-tree keeps its paths under v1 (route-map.md,
// HazCom section). NOTE: `training-compliance` arrived on `dev` after the map
// was generated and has no row in it — flagged in the handoff report.
const UPCOMING_DEADLINES_PATH = "/hazcom/dashboard/upcoming-deadlines";
const TRAINING_COMPLIANCE_PATH = "/hazcom/dashboard/training-compliance";

/** Spec defaults for the paged list endpoints. */
const HAZCOM_DEFAULT_PAGE: HazcomPageQueryDto = {
  pageNumber: 1,
  pageSize: 10,
};

/* -------------------------------------------------------------------------- */
/* Chemicals                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Create a chemical, or update one when the payload carries an `id`.
 *
 * The v1 rename split the old create-or-update `POST /api/hazcom/chemical`
 * into `POST /api/v1/hazcom/chemicals` and `PUT /api/v1/hazcom/chemicals/{id}`,
 * with edits gated on the new `HazCom.Update` permission. The branch lives here
 * so `ChemicalForm` is unchanged; the body shape is unchanged too.
 */
export async function createChemical(payload: ChemicalRequestDto) {
  const id = payload.id;
  const isUpdate = typeof id === "number" && Number.isFinite(id) && id > 0;

  const { data } = isUpdate
    ? await http.put<CreateChemicalResponseDto>(
        `${CHEMICAL_PATH}/${String(id)}`,
        payload,
      )
    : await http.post<CreateChemicalResponseDto>(CHEMICAL_PATH, payload);

  return data;
}

/** GET /api/v1/hazcom/chemicals?pageNumber&pageSize */
export async function getAllChemicals(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalsResponseDto>(CHEMICAL_PATH, {
    params: query,
  });

  return data;
}

/** GET /api/v1/hazcom/chemicals?status=draft */
/** GET /api/v1/hazcom/chemicals?status=published */
/** GET /api/v1/hazcom/chemicals/names — lookup list for the chemical pickers. */
export async function getChemicalNames() {
  const { data } =
    await http.get<GetChemicalNamesResponseDto>(CHEMICAL_NAMES_PATH);

  return data;
}

/** GET /api/v1/hazcom/chemicals/{id} */
export async function getChemicalById(id: number) {
  const { data } = await http.get<GetChemicalByIdResponseDto>(
    `${CHEMICAL_PATH}/${String(id)}`,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Safety data sheets                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Create an SDS record, or update one when the payload carries an `id`.
 *
 * Split out of the old create-or-update `POST /api/hazcom/sds` by the v1
 * rename; edits now go to `PUT /api/v1/hazcom/sds/{id}` under `HazCom.Update`.
 */
export async function createSafetyDataSheet(
  payload: SafetyDataSheetRequestDto,
) {
  const id = payload.id;
  const isUpdate = typeof id === "number" && Number.isFinite(id) && id > 0;

  const { data } = isUpdate
    ? await http.put<CreateSafetyDataSheetResponseDto>(
        `${SDS_PATH}/${String(id)}`,
        payload,
      )
    : await http.post<CreateSafetyDataSheetResponseDto>(SDS_PATH, payload);

  return data;
}

/** GET /api/v1/hazcom/sds?pageNumber&pageSize */
export async function getAllSafetyDataSheets(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllSafetyDataSheetsResponseDto>(SDS_PATH, {
    params: query,
  });

  return data;
}

/** GET /api/v1/hazcom/sds/{id} */
export async function getSafetyDataSheetById(id: number) {
  const { data } = await http.get<GetSafetyDataSheetByIdResponseDto>(
    `${SDS_PATH}/${String(id)}`,
  );

  return data;
}

/** DELETE /api/v1/hazcom/sds/{id} */
/** GET /api/v1/hazcom/sds/{id}/statements */
export async function getSdsStatements(id: number) {
  const { data } = await http.get<GetSdsStatementsResponseDto>(
    `${SDS_PATH}/${String(id)}/statements`,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* GHS code libraries                                                         */
/* -------------------------------------------------------------------------- */

/** GET /api/v1/hazcom/hazard-codes */
export async function getHazardHCodes() {
  const { data } = await http.get<GetHazardHCodesResponseDto>(HAZARD_CODE_PATH);

  return data;
}

/** GET /api/v1/hazcom/precautionary-codes */
export async function getPrecautionaryCodes() {
  const { data } = await http.get<GetPrecautionaryCodesResponseDto>(
    PRECAUTIONARY_CODE_PATH,
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Training                                                                   */
/* -------------------------------------------------------------------------- */

/** POST /api/v1/hazcom/trainings */
export async function createTrainingLog(payload: TrainingLogRequestDto) {
  const { data } = await http.post<CreateTrainingLogResponseDto>(
    TRAINING_PATH,
    payload,
  );

  return data;
}

/** GET /api/v1/hazcom/trainings?pageNumber&pageSize */
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

/** POST /api/v1/hazcom/risk-assessments */
export async function createChemicalRiskAssessment(
  payload: ChemicalRiskAssessmentRequestDto,
) {
  const { data } = await http.post<CreateChemicalRiskAssessmentResponseDto>(
    RISK_ASSESSMENT_PATH,
    payload,
  );

  return data;
}

/** GET /api/v1/hazcom/risk-assessments?pageNumber&pageSize */
export async function getAllChemicalRiskAssessments(
  query: HazcomPageQueryDto = HAZCOM_DEFAULT_PAGE,
) {
  const { data } = await http.get<GetAllChemicalRiskAssessmentsResponseDto>(
    RISK_ASSESSMENT_PATH,
    { params: query },
  );

  return data;
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

/** GET /api/hazcom/dashboard/upcoming-deadlines */
export async function getUpcomingDeadlines() {
  const { data } = await http.get<GetHazcomUpcomingDeadlinesResponseDto>(
    UPCOMING_DEADLINES_PATH,
  );

  return data;
}

/** GET /api/hazcom/dashboard/training-compliance */
export async function getTrainingCompliance() {
  const { data } = await http.get<GetHazcomTrainingComplianceResponseDto>(
    TRAINING_COMPLIANCE_PATH,
  );
  return data;
}
