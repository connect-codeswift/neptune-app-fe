/** One answered checklist item. */
export type AuditItemResponseRequestDto = {
  /** The template item's id — matches `missingItemIds` in a 400 response. */
  templateItemId: number;
  /** 0 until the item is backed by a response set. */
  responseOptionId: number;
  /** The chosen answer as text, e.g. "Yes". */
  valueText: string;
  note: string;
  isNA: boolean;
};

/** Body for POST /api/v1/audits/{id}/responses — records the audit's answers. */
export type SaveAuditResponsesRequestDto = {
  userId: number;
  siteId: number;
  responses: AuditItemResponseRequestDto[];
};

/** Body for POST /api/v1/audits — starts (schedules) an audit from a template. */
export type CreateAuditRequestDto = {
  /** 0 on create; the backend assigns the real id. */
  id: number;
  auditTitle: string;
  templateId: number;
  location: string;
  auditorId: number;
  /** ISO date-time string. */
  scheduleDate: string;
  /** ISO date-time string. Optional until the backend persists it. */
  dueDate?: string;
  userId: number;
  siteId: number;
};
