/** One answered checklist item sent with a submission. */
export type AuditItemResponseRequestDto = {
  /** The template item's id — matches `missingItemIds` in a 400 response. */
  itemId: number;
  answer: string;
};

/** Body for POST /api/Audit/{id}/submit — submits a completed audit. */
export type SubmitAuditRequestDto = {
  userId: number;
  subCompanyId: number;
  responses: AuditItemResponseRequestDto[];
};

/** Body for POST /api/Audit — starts (schedules) an audit from a template. */
export type CreateAuditRequestDto = {
  /** 0 on create; the backend assigns the real id. */
  id: number;
  auditTitle: string;
  templateId: number;
  location: string;
  auditorId: number;
  /** ISO date-time string. */
  scheduleDate: string;
  userId: number;
  subCompanyId: number;
};
