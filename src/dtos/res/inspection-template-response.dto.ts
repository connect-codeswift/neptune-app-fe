import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Inspection template summary as returned by the backend. */
export type InspectionTemplateDto = {
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
  userId: number;
  subCompanyId: number;
  createdDate: string;
  updatedDate: string;
  lastUsedDate: string;
  frequency: string;
  /** Sites this template may be run against, comma-separated. */
  allowSites: string;
};

/** Matches backend response for POST /api/InspectionTemplate. */
export type CreateInspectionTemplateResponseDto =
  ApiEnvelopeDto<InspectionTemplateDto | null>;

/** Matches backend response for POST /api/InspectionTemplate/{id}/publish. */
export type PublishInspectionTemplateResponseDto = ApiEnvelopeDto<{
  id: number;
  versionNo: number;
} | null>;

/** Matches backend response for GET /api/InspectionTemplate/GetAll. */
export type GetAllInspectionTemplatesResponseDto = ApiEnvelopeDto<
  PagedDataDto<InspectionTemplateDto>
>;

/**
 * A section row from GET /api/InspectionTemplate/{id}/sections.
 * Fields stay optional since the exact response shape isn't pinned down.
 */
export type InspectionTemplateSectionDto = {
  id: number;
  sectionTitle?: string;
  title?: string;
  description?: string;
  displayOrder?: number;
};

/** An item row from GET /api/InspectionTemplate/sections/{id}/items. */
export type InspectionTemplateItemDto = {
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

/** A rule from GET /api/InspectionTemplate/{id}/conditional-logics. */
export type InspectionTemplateLogicDto = {
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

export type GetInspectionTemplateSectionsResponseDto = ApiEnvelopeDto<
  InspectionTemplateSectionDto[] | null
>;

export type GetInspectionTemplateItemsResponseDto = ApiEnvelopeDto<
  InspectionTemplateItemDto[] | null
>;

export type GetInspectionTemplateLogicsResponseDto = ApiEnvelopeDto<
  InspectionTemplateLogicDto[] | null
>;
