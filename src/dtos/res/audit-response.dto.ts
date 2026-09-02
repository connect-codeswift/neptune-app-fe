import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** An audit row as returned by GET /api/v1/audits. */
export type AuditDto = {
  id: number;
  auditTitle: string;
  kind: string;
  templateId: number;
  templateName: string;
  location: string;
  auditorId: number;
  auditorName: string;
  scheduleDate: string;
  /** ISO date-time string. Optional until the backend persists it. */
  dueDate?: string | null;
  status: string;
  progressPct: number | null;
  answeredCount: number;
  findingCount: number;
  hasCriticalFailure: boolean;
  submittedAt: string | null;
};

/** Matches the backend response for POST /api/v1/audits. */
export type CreateAuditResponseDto = ApiEnvelopeDto<AuditDto | null>;

/** The audit's state after its answers were recorded. */
export type AuditResponsesResultDto = {
  id: number;
  status: string;
  progressPct: number | null;
  hasCriticalFailure: boolean;
  requiredItemIds: number[];
  visibleItemIds: number[];
};

/** Matches the backend response for POST /api/v1/audits/{id}/responses. */
export type SaveAuditResponsesResponseDto =
  ApiEnvelopeDto<AuditResponsesResultDto | null>;

/** Matches the backend response for GET /api/v1/audits (paged list). */
export type GetAllAuditsResponseDto = ApiEnvelopeDto<PagedDataDto<AuditDto>>;

/** One item inside a snapshotted section on an audit detail. */
export type AuditSnapshotItemDto = {
  id: number;
  itemType: string;
  /** Carries the item's value/answer text (mirrors the template item). */
  question: string;
  hint: string;
  isCritical: boolean;
  isRequired: boolean;
  allowNA: boolean;
  requireNote: boolean;
  requirePhoto: boolean;
  responseSetId: number | null;
  displayOrder: number;
};

/** One section of the template snapshot captured on the audit. */
export type AuditSnapshotSectionDto = {
  id: number;
  sectionTitle: string;
  description: string;
  displayOrder: number;
  items: AuditSnapshotItemDto[];
};

/** The template snapshot taken when the audit was created. */
export type AuditSnapshotDto = {
  templateId: number;
  templateName: string;
  description: string;
  kind: string;
  versionNo: number;
  responseSets: unknown[];
  sections: AuditSnapshotSectionDto[];
};

/** One recorded answer on an audit. */
export type AuditRecordedResponseDto = {
  id: number;
  templateItemId: number;
  responseOptionId: number;
  valueText: string;
  note: string;
  isNA: boolean;
  /** `Pass` | `Action` | `Critical`, or null on answers recorded before grading. */
  severity: string | null;
};

/** One piece of evidence attached to a run, optionally pinned to a question. */
export type AuditAttachmentDto = {
  id: number;
  auditId: number;
  /** Null when the file was attached to the run rather than to one question. */
  templateItemId: number | null;
  fileName: string;
  /** Server-relative, e.g. `upload/AuditEvidence/<guid>.png`. */
  filePath: string;
  mimeType: string | null;
  sizeBytes: number;
  createdDate: string;
};

/** A single audit's detail from GET /api/v1/audits/{id}. */
export type AuditDetailDto = {
  id: number;
  auditTitle: string;
  kind: string;
  location: string;
  auditorId: number;
  auditorName: string;
  scheduleDate: string;
  /** ISO date-time string. Optional until the backend persists it. */
  dueDate?: string | null;
  status: string;
  hasCriticalFailure: boolean;
  startedAt: string | null;
  submittedAt: string | null;
  templateId: number;
  templateVersionId: number;
  attachments: AuditAttachmentDto[];
  responses: AuditRecordedResponseDto[];
  snapshot: AuditSnapshotDto;
};

/** Matches the backend response for GET /api/v1/audits/{id}. */
export type GetAuditByIdResponseDto = ApiEnvelopeDto<AuditDetailDto | null>;

/**
 * A finding raised against an audit run — the exact shape of
 * `AuditRepository.MapFinding`, which is what `GET /{auditId}/findings` returns.
 *
 * These were previously optional and duplicated across guessed names
 * (`findingSeverity`, `findingCategory`, `question`, `isCapaCreated`) because the
 * response shape "wasn't pinned down yet". It is pinned down: only the fields
 * marked nullable below are ever absent.
 *
 * There is no CAPA field, and that is not an omission in the projection — no
 * entity in the backend links a finding to a CAPA at all.
 */
export type AuditFindingDto = {
  id: number;
  auditId: number;
  templateItemId: number | null;
  title: string;
  description: string | null;
  /** `Low` | `Medium` | `High` | `Critical`. An unrecognised value is rejected on write. */
  severity: string;
  category: string | null;
  /** `Open` | `InProgress` | `Closed`. */
  status: string;
  assigneeId: number | null;
  /** ISO-8601 with an explicit offset, or null. */
  dueDate: string | null;
  /** True when submitting the run raised it automatically — a critical fail or a CreateFinding rule. */
  isAutoRaised: boolean;
  createdDate: string;
  updatedDate: string | null;
};

/** Matches the backend response for GET /api/v1/audits/{id}/findings. */
export type GetAuditFindingsResponseDto = ApiEnvelopeDto<
  AuditFindingDto[] | null
>;

/** Matches the backend response for GET /api/v1/audits/{id}/report. Left as
 * `unknown` until the report's shape is pinned down. */
export type GetAuditReportResponseDto = ApiEnvelopeDto<unknown>;

/** The run's state after it was submitted. */
export type SubmitAuditResultDto = {
  id: number;
  status: string;
  hasCriticalFailure: boolean;
  /** How many findings the engine raised from Action/Critical answers. */
  autoRaisedFindings: number;
};

/** Matches the backend response for POST /api/v1/audits/{id}/submit. */
export type SubmitAuditResponseDto =
  ApiEnvelopeDto<SubmitAuditResultDto | null>;

/** Matches the backend response for POST /api/v1/audits/{id}/reopen. */
export type ReopenAuditResponseDto = ApiEnvelopeDto<unknown>;

/** Matches the backend response for POST /api/v1/audits/{id}/attachments. */
export type AddAuditAttachmentResponseDto = ApiEnvelopeDto<{
  id: number;
  filePath: string;
} | null>;
