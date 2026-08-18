import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** An inspection row as returned by GET /api/v1/inspections. */
export type InspectionDto = {
  id: number;
  inspectionTitle?: string;
  kind?: string;
  inspectionTemplateId?: number;
  templateName?: string;
  location?: string;
  inspectorId?: number;
  inspectorName?: string;
  scheduleDate?: string;
  status?: string;
  progressPct?: number | null;
  score?: number | null;
  answeredCount?: number;
  findingCount?: number;
  hasCriticalFailure?: boolean;
  submittedAt?: string | null;
};

/** Matches the backend response for GET /api/v1/inspections (paged list). */
export type GetAllInspectionsResponseDto = ApiEnvelopeDto<
  PagedDataDto<InspectionDto>
>;

/** Matches the backend response for POST /api/v1/inspections. */
export type CreateInspectionResponseDto = ApiEnvelopeDto<InspectionDto | null>;

/** One item inside a snapshotted section on an inspection. */
export type InspectionSnapshotItemDto = {
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
  inspectionResponseSetId: number | null;
  displayOrder: number;
};

/** One section of the template snapshot captured on the inspection. */
export type InspectionSnapshotSectionDto = {
  id: number;
  sectionTitle: string;
  description: string;
  displayOrder: number;
  items: InspectionSnapshotItemDto[];
};

/** The template snapshot taken when the inspection was created. */
export type InspectionSnapshotDto = {
  inspectionTemplateId: number;
  templateName: string;
  description: string;
  versionNo: number;
  passThreshold: number;
  isScoringEnable: boolean;
  isScoreVisibility: boolean;
  responseSets: unknown[];
  rules: unknown[];
  sections: InspectionSnapshotSectionDto[];
};

/**
 * One recorded answer on an inspection. The item reference is optional under
 * both names — the write side uses `inspectionItemId`, and the read side isn't
 * pinned down — so callers should fall back between them.
 */
export type InspectionRecordedResponseDto = {
  id: number;
  inspectionItemId?: number;
  templateItemId?: number;
  inspectionResponseOptionId?: number;
  responseOptionId?: number;
  valueText: string;
  note: string;
  isNA: boolean;
};

/** A single inspection's detail from GET /api/v1/inspections/{id}. */
export type InspectionDetailDto = {
  id: number;
  inspectionTitle: string;
  inspectionTemplateId: number;
  inspectionTemplateVersionId: number;
  location: string;
  inspectorId: number;
  inspectorName: string;
  scheduleDate: string;
  status?: string;
  score: number | null;
  hasCriticalFailure: boolean;
  startedAt?: string | null;
  submittedAt?: string | null;
  attachments: unknown[];
  responses: InspectionRecordedResponseDto[];
  snapshot: InspectionSnapshotDto;
};

/** Matches the backend response for GET /api/v1/inspections/{id}. */
export type GetInspectionByIdResponseDto =
  ApiEnvelopeDto<InspectionDetailDto | null>;

/** The inspection's state after its answers were recorded. */
export type InspectionResponsesResultDto = {
  id: number;
  status?: string;
  progressPct?: number | null;
  runningScore?: number | null;
  hasCriticalFailure?: boolean;
  requiredItemIds?: number[];
  visibleItemIds?: number[];
};

/** Matches the backend response for PUT /api/v1/inspections/{id}/responses. */
export type SaveInspectionResponsesResponseDto =
  ApiEnvelopeDto<InspectionResponsesResultDto | null>;

/**
 * A finding raised against an inspection. Fields stay optional and duplicated
 * across likely names since the exact response shape isn't pinned down yet.
 */
export type InspectionFindingDto = {
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

/**
 * Matches the backend response for GET /api/v1/inspections/{id}/findings.
 * On success, `dataModel` is always an array — empty when there are no findings:
 * `{ isError: false, dataModel: [], success: true, message: "Findings fetched successfully" }`
 */
export type GetInspectionFindingsResponseDto = ApiEnvelopeDto<
  InspectionFindingDto[]
>;
