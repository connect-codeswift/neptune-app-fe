/** Shared register list filters for GET /api/Audit and GET /api/Inspection. */
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
