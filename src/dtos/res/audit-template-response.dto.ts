import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Audit template summary as returned by GET /api/v1/audit-templates. */
export type AuditTemplateDto = {
  id: number;
  templateName: string;
  templateType: string;
  templateTags: string;
  description: string;
  isScoringEnable: boolean;
  passThreshold: number;
  isScoreVisibility: boolean;
  isTemplateDuplicationAllow: boolean;
  isAllowEditing: boolean;
  isDraft: boolean;
  isPublished: boolean;
  isArchived: boolean;
  currentVersion: number;
  sectionCount: number;
  itemCount: number;
  siteId: number;
  createdDate: string;
  updatedDate: string;
  lastUsedDate: string;
  frequency: string;
  /** Sites this template may be run against, comma-separated. */
  allowSites: string;
};

/** Matches backend response for POST /api/v1/audit-templates. */
export type CreateAuditTemplateResponseDto =
  ApiEnvelopeDto<AuditTemplateDto | null>;

/** Matches backend response for GET /api/v1/audit-templates. */
export type GetAllAuditTemplatesResponseDto = ApiEnvelopeDto<
  PagedDataDto<AuditTemplateDto>
>;

/**
 * A section row from GET /api/v1/audit-templates/{id}/sections.
 * Fields stay optional since the exact response shape isn't pinned down.
 */
export type AuditTemplateSectionDto = {
  id: number;
  sectionTitle?: string;
  title?: string;
  description?: string;
  displayOrder?: number;
};

/** An item row from GET /api/v1/audit-templates/sections/{id}/items. */
export type AuditTemplateItemDto = {
  id: number;
  itemType?: string;
  question?: string;
  hint?: string;
  scoreWeight?: number;
  itemWeight?: number;
  isRequired?: boolean;
  displayOrder?: number;
  templateSectionId?: number;
};

/** A rule from GET /api/v1/audit-templates/{id}/conditional-logics. */
export type AuditTemplateLogicDto = {
  id: number;
  status?: string;
  if?: string;
  condition?: string;
  then?: string;
  result?: string;
  operator?: string;
  conditionValue?: string;
  action?: string;
};

export type GetTemplateSectionsResponseDto = ApiEnvelopeDto<
  AuditTemplateSectionDto[] | null
>;

export type GetTemplateItemsResponseDto = ApiEnvelopeDto<
  AuditTemplateItemDto[] | null
>;

export type GetTemplateLogicsResponseDto = ApiEnvelopeDto<
  AuditTemplateLogicDto[] | null
>;
