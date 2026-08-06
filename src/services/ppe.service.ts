import type {
  IssuePpeRequestDto,
  ReplacePpeRequestDto,
} from "@/dtos/req/ppe-request.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type {
  AcknowledgePpeResponseDto,
  GetPpeIssueByIdResponseDto,
  GetPpeItemByIdResponseDto,
  GetPpeItemsResponseDto,
  GetPpeKpiResponseDto,
  IssuePpeResponseDto,
  PpeIssueDto,
  ReplacePpeRequestResponseDto,
} from "@/dtos/res/ppe-response.dto";
import http from "@/lib/axios";

const PPE_PATH = "/ppe";
const PPE_ISSUE_PATH = "/ppe/issue";
const PPE_ISSUE_BY_STATUS_PATH = "/ppe/issue/by-status";
const PPE_ISSUE_ASSIGNED_TO_PATH = "/ppe/issue/assigned-to";
const PPE_KPI_PATH = "/ppe/kpi";
const PPE_ACKNOWLEDGE_PATH = "/ppe/acknowledge";
const PPE_REPLACE_REQUEST_PATH = "/ppe/replace-request";

/** Matches backend response for GET /api/ppe/issue/by-status. */
export type GetPpeIssuesByStatusResponseDto = ApiEnvelopeDto<
  PpeIssueDto[] | null
>;

/** Matches backend response for GET /api/ppe/issue/assigned-to. */
export type GetPpeIssuesAssignedToResponseDto = ApiEnvelopeDto<
  PpeIssueDto[] | null
>;

export async function getPpeItems() {
  const { data } = await http.get<GetPpeItemsResponseDto>(PPE_PATH);

  return data;
}

/** GET /api/ppe/{id} */
export async function getPpeItemById(id: number) {
  const { data } = await http.get<GetPpeItemByIdResponseDto>(
    `${PPE_PATH}/${String(id)}`,
  );

  return data;
}

/** GET /api/ppe/issue/{id} */
export async function getPpeIssueById(id: number) {
  const { data } = await http.get<GetPpeIssueByIdResponseDto>(
    `${PPE_ISSUE_PATH}/${String(id)}`,
  );

  return data;
}

/** GET /api/ppe/issue/by-status */
export async function getPpeIssuesByStatus(status?: string) {
  const { data } = await http.get<GetPpeIssuesByStatusResponseDto>(
    PPE_ISSUE_BY_STATUS_PATH,
    {
      params: status ? { status } : undefined,
    },
  );

  return data;
}

/** GET /api/ppe/issue/assigned-to — current user's assigned PPE for acknowledgement. */
export async function getPpeIssuesAssignedTo() {
  const { data } = await http.get<GetPpeIssuesAssignedToResponseDto>(
    PPE_ISSUE_ASSIGNED_TO_PATH,
  );

  return data;
}

/** GET /api/ppe/kpi */
export async function getPpeKpi() {
  const { data } = await http.get<GetPpeKpiResponseDto>(PPE_KPI_PATH);

  return data;
}

export async function issuePpe(payload: IssuePpeRequestDto) {
  const { data } = await http.post<IssuePpeResponseDto>(
    PPE_ISSUE_PATH,
    payload,
  );

  return data;
}

export type AcknowledgePpeParams = Readonly<{
  issueId: number;
  /** Tenant database name — Organizations.Name, e.g. "Acme". */
  org: string;
  siteId: number;
}>;

export async function acknowledgePpe(params: AcknowledgePpeParams) {
  const { data } = await http.post<AcknowledgePpeResponseDto>(
    PPE_ACKNOWLEDGE_PATH,
    null,
    {
      params: {
        issueId: params.issueId,
        org: params.org,
        siteId: params.siteId,
      },
    },
  );

  return data;
}

/** POST /api/ppe/replace-request */
export async function createReplacePpeRequest(payload: ReplacePpeRequestDto) {
  const { data } = await http.post<ReplacePpeRequestResponseDto>(
    PPE_REPLACE_REQUEST_PATH,
    payload,
  );

  return data;
}
