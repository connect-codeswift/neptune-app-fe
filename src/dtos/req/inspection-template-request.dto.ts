/** One checklist item inside a template section. */
export type InspectionTemplateItemRequestDto = {
  id: number;
  itemType: string;
  question: string;
  hint: string;
  scoreWeight: number;
  itemWeight: number;
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
  subCompanyId: number;
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
  subCompanyId: number;
  /** Non-nullable on the backend; 0 on create, then set from the parent. */
  inspectionTemplateId: number;
  items: InspectionTemplateItemRequestDto[];
};

/** One IF/THEN conditional-logic rule. */
export type InspectionTemplateLogicRequestDto = {
  id: number;
  status: string;
  if: string;
  condition: string;
  then: string;
  result: string;
  /** Null until the rule points at a saved item — 0 would be a dangling FK. */
  sourceItemId: number | null;
  operator: string;
  conditionValue: string;
  action: string;
  targetItemId: number | null;
  findingSeverity: string;
  findingCategory: string;
  isDraft: boolean;
  isPublished: boolean;
  userId: number;
  subCompanyId: number;
  inspectionTemplateId: number;
};

/** Matches the backend body for creating an inspection template. */
export type CreateInspectionTemplateRequestDto = {
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
  /** Null until an assignee is chosen — 0 would be a dangling FK. */
  defaultAssigneeId: number | null;
  defaultLocation: string;
  /** Sites this template may be run against, comma-separated. */
  allowSites: string;
  frequency: string;
  scheduleStartDate: string;
  dueWindowDays: number;
  notifyAssignee: boolean;
  userId: number;
  subCompanyId: number;
  sections: InspectionTemplateSectionRequestDto[];
  conditionalLogics: InspectionTemplateLogicRequestDto[];
};
