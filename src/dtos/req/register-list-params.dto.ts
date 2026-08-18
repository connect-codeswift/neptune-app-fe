/** Shared register list filters for GET /api/v1/audits and GET /api/v1/inspections. */
export type RegisterListParams = Readonly<{
  pageNumber: number;
  pageSize: number;
  /** API status value, e.g. InProgress — omit for all. */
  status?: string;
  assigneeId?: number;
  from?: string;
  to?: string;
  search?: string;
}>;
