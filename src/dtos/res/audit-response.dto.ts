import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** An audit row as returned by GET /api/Audit. */
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
  status: string;
  progressPct: number | null;
  score: number | null;
  answeredCount: number;
  findingCount: number;
  hasCriticalFailure: boolean;
  submittedAt: string | null;
};

/** Matches the backend response for POST /api/Audit. */
export type CreateAuditResponseDto = ApiEnvelopeDto<AuditDto | null>;

/** Matches the backend response for POST /api/Audit/{id}/submit. */
export type SubmitAuditResponseDto = ApiEnvelopeDto<AuditDto | null>;

/** Matches the backend response for GET /api/Audit (paged list). */
export type GetAllAuditsResponseDto = ApiEnvelopeDto<PagedDataDto<AuditDto>>;

/** One item inside a snapshotted section on an audit detail. */
export type AuditSnapshotItemDto = {
  id: number;
  itemType: string;
  /** Carries the item's value/answer text (mirrors the template item). */
  question: string;
  hint: string;
  scoreWeight: number;
  itemWeight: number;
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
  passThreshold: number;
  isScoringEnable: boolean;
  isScoreVisibility: boolean;
  responseSets: unknown[];
  rules: unknown[];
  sections: AuditSnapshotSectionDto[];
};

/** A single audit's detail from GET /api/Audit/{id}. */
export type AuditDetailDto = {
  id: number;
  auditTitle: string;
  kind: string;
  location: string;
  auditorId: number;
  auditorName: string;
  scheduleDate: string;
  status: string;
  score: number | null;
  hasCriticalFailure: boolean;
  startedAt: string | null;
  submittedAt: string | null;
  templateId: number;
  templateVersionId: number;
  attachments: unknown[];
  responses: unknown[];
  snapshot: AuditSnapshotDto;
};

/** Matches the backend response for GET /api/Audit/{id}. */
export type GetAuditByIdResponseDto = ApiEnvelopeDto<AuditDetailDto | null>;

/**
 * A finding raised against an audit. Fields stay optional and duplicated across
 * likely names since the exact response shape isn't pinned down yet.
 */
export type AuditFindingDto = {
  id: number;
  severity?: string;
  findingSeverity?: string;
  category?: string;
  findingCategory?: string;
  description?: string;
  title?: string;
  question?: string;
  status?: string;
  capaCreated?: boolean;
  isCapaCreated?: boolean;
};

/** Matches the backend response for GET /api/Audit/{id}/findings. */
export type GetAuditFindingsResponseDto = ApiEnvelopeDto<
  AuditFindingDto[] | null
>;

/** Matches the backend response for GET /api/Audit/{id}/report. Left as
 * `unknown` until the report's shape is pinned down. */
export type GetAuditReportResponseDto = ApiEnvelopeDto<unknown>;
