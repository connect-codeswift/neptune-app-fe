import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import type {
  GetAuditDetailSummaryResponseDto,
  GetAuditSummaryResponseDto,
} from "@/dtos/res/audit-inspection-dashboard.dto";
import type {
  AddAuditAttachmentResponseDto,
  CreateAuditResponseDto,
  GetAllAuditsResponseDto,
  GetAuditByIdResponseDto,
  GetAuditFindingsResponseDto,
  GetAuditReportResponseDto,
  DeleteAuditAttachmentResponseDto,
  ReopenAuditResponseDto,
  SaveAuditResponsesResponseDto,
  SubmitAuditResponseDto,
} from "@/dtos/res/audit-response.dto";
import type {
  CreateAuditRequestDto,
  LinkAuditAttachmentRequestDto,
  ReopenAuditRequestDto,
  SaveAuditResponsesRequestDto,
  SubmitAuditRequestDto,
} from "@/dtos/req/audit-request.dto";
import http from "@/lib/axios";
import {
  normalizeDetailSummaryDto,
  normalizeSummaryDto,
} from "@/lib/map-audit-inspection-dashboard";

const AUDIT_PATH = "/audits";

function buildRegisterQueryParams(params: RegisterListParams) {
  return {
    kind: "Audit",
    PageNumber: params.pageNumber,
    PageSize: params.pageSize,
    Status: params.status || undefined,
    AssigneeId: params.assigneeId,
    From: params.from,
    To: params.to,
    Search: params.search || undefined,
  };
}

export async function createAudit(payload: CreateAuditRequestDto) {
  const { data } = await http.post<CreateAuditResponseDto>(AUDIT_PATH, payload);
  return data;
}

export async function getAllAudits(params: RegisterListParams) {
  const { data } = await http.get<GetAllAuditsResponseDto>(AUDIT_PATH, {
    params: buildRegisterQueryParams(params),
  });

  return data;
}

export async function getAuditSummary() {
  const { data } = await http.get<GetAuditSummaryResponseDto>(
    `${AUDIT_PATH}/summary`,
    { params: { kind: "Audit" } },
  );

  return {
    ...data,
    dataModel: normalizeSummaryDto(data.dataModel),
  };
}

export async function getAuditById(auditId: string) {
  const { data } = await http.get<GetAuditByIdResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}`,
  );

  return data;
}

export async function getAuditDetailSummary(auditId: string) {
  const { data } = await http.get<GetAuditDetailSummaryResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/detail-summary`,
  );

  return {
    ...data,
    dataModel: normalizeDetailSummaryDto(data.dataModel),
  };
}

export async function getAuditFindings(auditId: string) {
  const { data } = await http.get<GetAuditFindingsResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/findings`,
  );

  return data;
}

export async function saveAuditResponses(
  auditId: string,
  payload: SaveAuditResponsesRequestDto,
) {
  const { data } = await http.put<SaveAuditResponsesResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/responses`,
    payload,
  );

  return data;
}

export async function getAuditReport(auditId: string) {
  const { data } = await http.get<GetAuditReportResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/report`,
  );

  return data;
}

/**
 * Locks the run, computes the authoritative score and auto-raises a finding for
 * every Action/Critical answer. One-way: only `reopenAudit` undoes it.
 *
 * Rejects with 400 when required questions are unanswered or required evidence
 * is missing; the ids come back in `errorDetails` — see `readSubmitBlockers`.
 */
export async function submitAudit(
  auditId: string,
  payload: SubmitAuditRequestDto,
) {
  const { data } = await http.post<SubmitAuditResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/submit`,
    payload,
  );

  return data;
}

/** Puts a submitted run back to InProgress. Lead-only, and the reason is recorded. */
export async function reopenAudit(
  auditId: string,
  payload: ReopenAuditRequestDto,
) {
  const { data } = await http.post<ReopenAuditResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/reopen`,
    payload,
  );

  return data;
}

/**
 * Links evidence that is already in the bucket.
 *
 * The bytes do not come through here: the caller runs `uploadFile` first
 * (intent → PUT to the presigned url → commit) and passes the resulting handle.
 * Evidence used to be posted here as multipart and written to the API node's own
 * disk, where it did not survive a deploy.
 */
export async function addAuditAttachment(
  auditId: string,
  payload: LinkAuditAttachmentRequestDto,
) {
  const { data } = await http.post<AddAuditAttachmentResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/attachments`,
    payload,
  );

  return data;
}

/** Unlinks evidence. The stored file itself is left in place. */
export async function deleteAuditAttachment(
  auditId: string,
  attachmentId: number,
) {
  const { data } = await http.delete<DeleteAuditAttachmentResponseDto>(
    `${AUDIT_PATH}/${encodeURIComponent(auditId)}/attachments/${String(attachmentId)}`,
  );

  return data;
}
