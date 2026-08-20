/** One checklist item inside a template section. */
export type InspectionTemplateItemRequestDto = {
  id: number;
  itemType: string;
  question: string;
  hint: string;
  /** Null until a response set is chosen — 0 would be a dangling FK. */
  responseSetId: number | null;
  isCritical: boolean;
  allowNA: boolean;
  requireNote: boolean;
  requirePhoto: boolean;
  isRequired: boolean;
  displayOrder: number;
  isDraft: boolean;
  isPublished: boolean;
  userId: number;
  siteId: number;
  /** Non-nullable on the backend; 0 on create, then set from the parent. */
  templateSectionId: number;
};

/** One section of a template, carrying its items. */
export type InspectionTemplateSectionRequestDto = {
  id: number;
  sectionTitle: string;
  description: string;
  displayOrder: number;
  isDraft: boolean;
  isPublished: boolean;
  userId: number;
  siteId: number;
  /** Non-nullable on the backend; 0 on create, then set from the parent. */
  inspectionTemplateId: number;
  items: InspectionTemplateItemRequestDto[];
};

/** An item on the update body — the FK fields differ from the create shape. */
export type UpdateInspectionTemplateItemRequestDto = Omit<
  InspectionTemplateItemRequestDto,
  "responseSetId" | "templateSectionId"
> & {
  /** Null until the item is backed by a response set. */
  inspectionResponseSetId: number | null;
  /** The parent section's id; 0 for a section being created. */
  inspectionSectionId: number;
};

/** A section on the update body, carrying its items. */
export type UpdateInspectionTemplateSectionRequestDto = Omit<
  InspectionTemplateSectionRequestDto,
  "items"
> & {
  items: UpdateInspectionTemplateItemRequestDto[];
};

/** Matches the backend body for creating an inspection template. */
export type CreateInspectionTemplateRequestDto = {
  templateName: string;
  templateType: string;
  templateTags: string;
  description: string;
  isDraft: boolean;
  isPublished: boolean;
  /** Null until an assignee is chosen — 0 would be a dangling FK. */
  defaultAssigneeId: number | null;
  defaultLocation: string;
  frequency: string;
  scheduleStartDate: string;
  dueWindowDays: number;
  notifyAssignee: boolean;
  userId: number;
  siteId: number;
  sections: InspectionTemplateSectionRequestDto[];
};

/**
 * Matches the backend body for PUT /api/v1/inspection-templates/{id}, which renames
 * the item FKs to `inspectionResponseSetId` / `inspectionSectionId`.
 */
export type UpdateInspectionTemplateRequestDto = Omit<
  CreateInspectionTemplateRequestDto,
  "sections"
> & {
  sections: UpdateInspectionTemplateSectionRequestDto[];
};
