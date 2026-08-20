/** One checklist item inside a template section. */
export type AuditTemplateItemRequestDto = {
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
export type AuditTemplateSectionRequestDto = {
  id: number;
  sectionTitle: string;
  description: string;
  displayOrder: number;
  isDraft: boolean;
  isPublished: boolean;
  userId: number;
  siteId: number;
  /** Non-nullable on the backend; 0 on create, then set from the parent. */
  auditTemplateId: number;
  items: AuditTemplateItemRequestDto[];
};

/** Matches the backend body for creating an audit template. */
export type CreateAuditTemplateRequestDto = {
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
  sections: AuditTemplateSectionRequestDto[];
};

/**
 * The update (PUT) body is the same flat template shape plus a root-level
 * `expectedUpdatedDate` for the backend's optimistic-concurrency check. It must
 * be an ISO date-time string, or null to skip the check.
 */
export type UpdateAuditTemplateRequestDto = CreateAuditTemplateRequestDto & {
  expectedUpdatedDate: string | null;
};
