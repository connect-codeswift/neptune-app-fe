import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Audit template summary as returned by GET /api/v1/audit-templates. */
export type AuditTemplateDto = {
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
  siteId: number;
  createdDate: string;
  updatedDate: string;
  lastUsedDate: string;
  frequency: string;
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
  isRequired?: boolean;
  displayOrder?: number;
  templateSectionId?: number;
};

export type GetTemplateSectionsResponseDto = ApiEnvelopeDto<
  AuditTemplateSectionDto[] | null
>;

export type GetTemplateItemsResponseDto = ApiEnvelopeDto<
  AuditTemplateItemDto[] | null
>;
