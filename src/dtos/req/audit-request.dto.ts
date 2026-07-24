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
