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

const PPE_ITEMS_PATH = "/ppe/items";
const PPE_ISSUES_PATH = "/ppe/issues";
const PPE_ISSUES_ASSIGNED_TO_ME_PATH = "/ppe/issues/assigned-to-me";
const PPE_KPI_PATH = "/ppe/kpis";
const PPE_REPLACE_REQUESTS_PATH = "/ppe/replace-requests";

/** Matches backend response for GET /api/v1/ppe/issues?status=. */
export type GetPpeIssuesByStatusResponseDto = ApiEnvelopeDto<
  PpeIssueDto[] | null
>;

/** Matches backend response for GET /api/v1/ppe/issues/assigned-to-me. */
export type GetPpeIssuesAssignedToResponseDto = ApiEnvelopeDto<
  PpeIssueDto[] | null
>;

export async function getPpeItems() {
  const { data } = await http.get<GetPpeItemsResponseDto>(PPE_ITEMS_PATH);

  return data;
}

/** GET /api/v1/ppe/items/{id} */
export async function getPpeItemById(id: number) {
  const { data } = await http.get<GetPpeItemByIdResponseDto>(
    `${PPE_ITEMS_PATH}/${String(id)}`,
  );

  return data;
}

/** GET /api/v1/ppe/issues/{id} */
export async function getPpeIssueById(id: number) {
  const { data } = await http.get<GetPpeIssueByIdResponseDto>(
    `${PPE_ISSUES_PATH}/${String(id)}`,
  );

  return data;
}

/**
 * GET /api/v1/ppe/issues?status=
 * The old dedicated `/ppe/issue/by-status` path collapsed into a query
 * parameter on the issues collection.
 */
export async function getPpeIssuesByStatus(status?: string) {
  const { data } = await http.get<GetPpeIssuesByStatusResponseDto>(
    PPE_ISSUES_PATH,
    {
      params: status ? { status } : undefined,
    },
  );

  return data;
}

/** GET /api/v1/ppe/issues/assigned-to-me — current user's assigned PPE for acknowledgement. */
export async function getPpeIssuesAssignedTo() {
  const { data } = await http.get<GetPpeIssuesAssignedToResponseDto>(
    PPE_ISSUES_ASSIGNED_TO_ME_PATH,
  );

  return data;
}

/** GET /api/v1/ppe/kpis */
export async function getPpeKpi() {
  const { data } = await http.get<GetPpeKpiResponseDto>(PPE_KPI_PATH);

  return data;
}

export async function issuePpe(payload: IssuePpeRequestDto) {
  const { data } = await http.post<IssuePpeResponseDto>(
    PPE_ISSUES_PATH,
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

/**
 * POST /api/v1/ppe/issues/{id}/acknowledge
 * The issue id moved out of the query string into the path in the v1 rename;
 * `org` and `siteId` stay as query parameters.
 */
export async function acknowledgePpe(params: AcknowledgePpeParams) {
  const { data } = await http.post<AcknowledgePpeResponseDto>(
    `${PPE_ISSUES_PATH}/${String(params.issueId)}/acknowledge`,
    null,
    {
      params: {
        org: params.org,
        siteId: params.siteId,
      },
    },
  );

  return data;
}

/** POST /api/v1/ppe/replace-requests */
export async function createReplacePpeRequest(payload: ReplacePpeRequestDto) {
  const { data } = await http.post<ReplacePpeRequestResponseDto>(
    PPE_REPLACE_REQUESTS_PATH,
    payload,
  );

  return data;
}
