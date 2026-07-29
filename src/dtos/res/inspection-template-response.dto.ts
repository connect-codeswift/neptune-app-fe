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

/** Matches backend response for GET /api/InspectionTemplate/GetAll. */
export type GetAllInspectionTemplatesResponseDto = ApiEnvelopeDto<
  PagedDataDto<InspectionTemplateDto>
>;
