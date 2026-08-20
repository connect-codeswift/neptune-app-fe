import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Inspection template summary as returned by the backend. */
export type InspectionTemplateDto = {
  id: number;
  templateName: string;
  templateType: string;
  templateTags: string;
  description: string;
  isDraft: boolean;
  isPublished: boolean;
  isArchived: boolean;
  currentVersion: number;
  sectionCount: number;
  itemCount: number;
  userId: number;
  siteId: number;
  createdDate: string;
  updatedDate: string;
  lastUsedDate: string;
  frequency: string;
};

/** Matches backend response for POST /api/v1/inspection-templates. */
export type CreateInspectionTemplateResponseDto =
  ApiEnvelopeDto<InspectionTemplateDto | null>;

/** Matches backend response for POST /api/v1/inspection-templates/{id}/publish. */
export type PublishInspectionTemplateResponseDto = ApiEnvelopeDto<{
  id: number;
  versionNo: number;
} | null>;

/** Matches backend response for GET /api/v1/inspection-templates. */
export type GetAllInspectionTemplatesResponseDto = ApiEnvelopeDto<
  PagedDataDto<InspectionTemplateDto>
>;

/**
 * A section row from GET /api/v1/inspection-templates/{id}/sections.
 * Fields stay optional since the exact response shape isn't pinned down.
 */
export type InspectionTemplateSectionDto = {
  id: number;
  sectionTitle?: string;
  title?: string;
  description?: string;
  displayOrder?: number;
};

/** An item row from GET /api/v1/inspection-templates/sections/{id}/items. */
export type InspectionTemplateItemDto = {
  id: number;
  itemType?: string;
  question?: string;
  hint?: string;
  isRequired?: boolean;
  displayOrder?: number;
  templateSectionId?: number;
};

export type GetInspectionTemplateSectionsResponseDto = ApiEnvelopeDto<
  InspectionTemplateSectionDto[] | null
>;

export type GetInspectionTemplateItemsResponseDto = ApiEnvelopeDto<
  InspectionTemplateItemDto[] | null
>;
