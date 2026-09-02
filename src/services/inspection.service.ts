import type { RegisterListParams } from "@/dtos/req/register-list-params.dto";
import type {
  CreateInspectionRequestDto,
  LinkInspectionAttachmentRequestDto,
  ReopenInspectionRequestDto,
  SaveInspectionResponsesRequestDto,
  SubmitInspectionRequestDto,
} from "@/dtos/req/inspection-request.dto";
import type {
  GetInspectionDetailSummaryResponseDto,
  GetInspectionSummaryResponseDto,
} from "@/dtos/res/audit-inspection-dashboard.dto";
import type {
  AddInspectionAttachmentResponseDto,
  CreateInspectionResponseDto,
  DeleteInspectionAttachmentResponseDto,
  GetAllInspectionsResponseDto,
  GetInspectionByIdResponseDto,
  GetInspectionFindingsResponseDto,
  ReopenInspectionResponseDto,
  SaveInspectionResponsesResponseDto,
  SubmitInspectionResponseDto,
} from "@/dtos/res/inspection-response.dto";
import http from "@/lib/axios";
import {
  normalizeDetailSummaryDto,
  normalizeSummaryDto,
} from "@/lib/map-audit-inspection-dashboard";

const INSPECTION_PATH = "/inspections";

function buildRegisterQueryParams(params: RegisterListParams) {
  return {
    PageNumber: params.pageNumber,
    PageSize: params.pageSize,
    Status: params.status || undefined,
    AssigneeId: params.assigneeId,
    From: params.from,
    To: params.to,
    Search: params.search || undefined,
  };
}

export async function createInspection(payload: CreateInspectionRequestDto) {
  const { data } = await http.post<CreateInspectionResponseDto>(
    INSPECTION_PATH,
    payload,
  );
  return data;
}

export async function getAllInspections(params: RegisterListParams) {
  const { data } = await http.get<GetAllInspectionsResponseDto>(
    INSPECTION_PATH,
    { params: buildRegisterQueryParams(params) },
  );

  return data;
}

export async function getInspectionSummary() {
  const { data } = await http.get<GetInspectionSummaryResponseDto>(
    `${INSPECTION_PATH}/summary`,
  );

  return {
    ...data,
    dataModel: normalizeSummaryDto(data.dataModel),
  };
}

export async function saveInspectionResponses(
  inspectionId: string,
  payload: SaveInspectionResponsesRequestDto,
) {
  const { data } = await http.put<SaveInspectionResponsesResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/responses`,
    payload,
  );
  return data;
}

export async function getInspectionById(inspectionId: string) {
  const { data } = await http.get<GetInspectionByIdResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}`,
  );

  return data;
}

export async function getInspectionDetailSummary(inspectionId: string) {
  const { data } = await http.get<GetInspectionDetailSummaryResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/detail-summary`,
  );

  return {
    ...data,
    dataModel: normalizeDetailSummaryDto(data.dataModel),
  };
}

export async function getInspectionFindings(inspectionId: string) {
  const { data } = await http.get<GetInspectionFindingsResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/findings`,
  );

  return data;
}

/**
 * Locks the run, computes the authoritative score and auto-raises a finding for
 * every Action/Critical answer. One-way: only `reopenInspection` undoes it.
 *
 * Rejects with 400 when required questions are unanswered or required evidence
 * is missing; the ids come back in `errorDetails` — see `readSubmitBlockers`.
 */
export async function submitInspection(
  inspectionId: string,
  payload: SubmitInspectionRequestDto,
) {
  const { data } = await http.post<SubmitInspectionResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/submit`,
    payload,
  );

  return data;
}

/** Puts a submitted run back to InProgress. Lead-only, and the reason is recorded. */
export async function reopenInspection(
  inspectionId: string,
  payload: ReopenInspectionRequestDto,
) {
  const { data } = await http.post<ReopenInspectionResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/reopen`,
    payload,
  );

  return data;
}

/**
 * Links evidence that is already in the bucket. The bytes do not come through
 * here: the caller runs `uploadFile` first and passes the resulting handle.
 */
export async function addInspectionAttachment(
  inspectionId: string,
  payload: LinkInspectionAttachmentRequestDto,
) {
  const { data } = await http.post<AddInspectionAttachmentResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/attachments`,
    payload,
  );

  return data;
}

/** Unlinks evidence. The stored file itself is left in place. */
export async function deleteInspectionAttachment(
  inspectionId: string,
  attachmentId: number,
) {
  const { data } = await http.delete<DeleteInspectionAttachmentResponseDto>(
    `${INSPECTION_PATH}/${encodeURIComponent(inspectionId)}/attachments/${String(attachmentId)}`,
  );

  return data;
}
