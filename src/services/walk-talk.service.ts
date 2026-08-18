import type {
  CreateWalkTalkRequestDto,
  GetWalkTalkSessionsParams,
} from "@/dtos/req/walk-talk-request.dto";
import type {
  CreateWalkTalkResponseDto,
  GetWalkTalkDashboardCountsResponseDto,
  GetWalkTalkGraphResponseDto,
  GetWalkTalkSessionByIdResponseDto,
  GetWalkTalkSessionsResponseDto,
  GetWalkTalkTopFindingsResponseDto,
} from "@/dtos/res/walk-talk-response.dto";
import http from "@/lib/axios";

const WALK_TALK_PATH = "/walkandtalk";
const DASHBOARD_COUNTS_PATH = `${WALK_TALK_PATH}/dashboard-counts`;
const TOP_FINDINGS_PATH = `${WALK_TALK_PATH}/top-findings`;
const GRAPH_PATH = `${WALK_TALK_PATH}/graph`;

/** Fetches dashboard counts from GET /api/walkandtalk/dashboard-counts. */
export async function getWalkTalkDashboardCounts() {
  const { data } = await http.get<GetWalkTalkDashboardCountsResponseDto>(
    DASHBOARD_COUNTS_PATH,
  );

  return data;
}

/** Fetches top findings from GET /api/walkandtalk/top-findings. */
export async function getWalkTalkTopFindings() {
  const { data } =
    await http.get<GetWalkTalkTopFindingsResponseDto>(TOP_FINDINGS_PATH);

  return data;
}

/** Fetches trend graph series from GET /api/walkandtalk/graph. */
export async function getWalkTalkGraph(weeks: number) {
  const { data } = await http.get<GetWalkTalkGraphResponseDto>(GRAPH_PATH, {
    params: { weeks },
  });

  return data;
}

/** Fetches a paged walk-and-talk list from GET /api/walkandtalk. */
export async function getWalkTalkSessions(params: GetWalkTalkSessionsParams) {
  const { data } = await http.get<GetWalkTalkSessionsResponseDto>(
    WALK_TALK_PATH,
    {
      params: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    },
  );

  return data;
}

/** Fetches one walk-and-talk session from GET /api/walkandtalk/{id}. */
export async function getWalkTalkSessionById(id: number | string) {
  const { data } = await http.get<GetWalkTalkSessionByIdResponseDto>(
    `${WALK_TALK_PATH}/${encodeURIComponent(String(id))}`,
  );

  return data;
}

/** Creates a walk-and-talk session via POST /api/walkandtalk. */
export async function createWalkTalk(payload: CreateWalkTalkRequestDto) {
  const { data } = await http.post<CreateWalkTalkResponseDto>(
    WALK_TALK_PATH,
    payload,
  );

  return data;
}
