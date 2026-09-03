/** How the auditor graded one answered item. Absent = still Pending. */
export const AUDIT_SEVERITIES = ["Pass", "Action", "Critical"] as const;

export type AuditSeverity = (typeof AUDIT_SEVERITIES)[number];

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
  /**
   * The grade the auditor picked. The backend derives Pass/Action/Critical from
   * this; omitting it falls back to the response option, which audit templates
   * do not carry, so every answer would grade as Pass.
   */
  severity?: AuditSeverity | null;
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

/**
 * Body for PUT /api/v1/audits/{id} — edits a run that has not been submitted.
 *
 * Narrower than the create payload on purpose. `templateId` is absent because a
 * run's answers are keyed to the template version pinned when it was created, so
 * swapping the template would orphan every answer already recorded — that is a
 * new run, not an edit. `userId`/`siteId` are absent because the backend stamps
 * both from the token and ignores whatever a caller sends.
 */
export type UpdateAuditRequestDto = {
  auditTitle: string;
  location: string;
  auditorId: number;
  /** ISO date-time string. */
  scheduleDate: string;
  /** ISO date-time string. Cleared by omitting it. */
  dueDate?: string;
};

/** Body for POST /api/v1/audits/{id}/submit — locks the run and raises findings. */
export type SubmitAuditRequestDto = {
  userId: number;
  siteId: number;
};

/** Body for POST /api/v1/audits/{id}/reopen — lead-only correction path. */
export type ReopenAuditRequestDto = {
  userId: number;
  siteId: number;
  reason: string;
};

/**
 * Body for POST /api/v1/audits/{id}/attachments — links a file already uploaded
 * through the files pipeline. `templateItemId` null attaches it to the run
 * rather than to one question.
 */
export type LinkAuditAttachmentRequestDto = {
  fileId: string;
  templateItemId: number | null;
};
