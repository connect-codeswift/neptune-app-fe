import type {
  CreateBbsObservationRequestDto,
  GetBbsObservationsParams,
  UpdateBbsObservationRequestDto,
} from "@/dtos/req/bbs-request.dto";
import type {
  CreateBbsObservationResponseDto,
  GetBbsAtRiskCategoriesResponseDto,
  GetBbsDashboardKpiResponseDto,
  GetBbsGraphResponseDto,
  GetBbsObservationByIdResponseDto,
  GetBbsObservationsResponseDto,
  GetBehaviorCategoriesResponseDto,
  UpdateBbsObservationResponseDto,
} from "@/dtos/res/bbs-response.dto";
import http from "@/lib/axios";

const BBS_PATH = "/bbs";
const BEHAVIOR_CATEGORIES_PATH = "/bbs/behavior-categories";
const BBS_DASHBOARD_KPI_PATH = "/bbs/dashboard-kpi";
const BBS_AT_RISK_CATEGORIES_PATH = "/bbs/at-risk-categories";
const BBS_GRAPH_PATH = "/bbs/graph";
const DEFAULT_BBS_GRAPH_WEEKS = 12;

export async function getBehaviorCategories() {
  const { data } = await http.get<GetBehaviorCategoriesResponseDto>(
    BEHAVIOR_CATEGORIES_PATH,
  );

  return data;
}

/** Fetches a paged BBS observation list from GET /api/bbs. */
export async function getBbsObservations(params: GetBbsObservationsParams) {
  const { data } = await http.get<GetBbsObservationsResponseDto>(BBS_PATH, {
    params: {
      observe: params.observe,
      ...(params.categoryId !== undefined
        ? { categoryId: params.categoryId }
        : {}),
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    },
  });

  return data;
}

/** Fetches one BBS observation from GET /api/bbs/{id}. */
export async function getBbsObservationById(id: number | string) {
  const { data } = await http.get<GetBbsObservationByIdResponseDto>(
    `${BBS_PATH}/${encodeURIComponent(String(id))}`,
  );

  return data;
}

/** Fetches BBS dashboard KPIs from GET /api/bbs/dashboard-kpi. */
export async function getBbsDashboardKpi() {
  const { data } = await http.get<GetBbsDashboardKpiResponseDto>(
    BBS_DASHBOARD_KPI_PATH,
  );

  return data;
}

/** Fetches at-risk category breakdown from GET /api/bbs/at-risk-categories. */
export async function getBbsAtRiskCategories() {
  const { data } = await http.get<GetBbsAtRiskCategoriesResponseDto>(
    BBS_AT_RISK_CATEGORIES_PATH,
  );

  return data;
}

/** Fetches engagement graph series from GET /api/bbs/graph. */
export async function getBbsGraph(weeks = DEFAULT_BBS_GRAPH_WEEKS) {
  const { data } = await http.get<GetBbsGraphResponseDto>(BBS_GRAPH_PATH, {
    params: { weeks },
  });

  return data;
}

export async function createBbsObservation(
  payload: CreateBbsObservationRequestDto,
) {
  const { data } = await http.post<CreateBbsObservationResponseDto>(
    BBS_PATH,
    payload,
  );

  return data;
}

/** Updates one BBS observation via PUT /api/bbs (id in body). */
export async function updateBbsObservation(
  payload: UpdateBbsObservationRequestDto,
) {
  const { data } = await http.post<UpdateBbsObservationResponseDto>(
    BBS_PATH,
    payload,
  );

  return data;
}
