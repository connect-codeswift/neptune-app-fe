/**
 * POST /api/v1/compliance-records/search
 * Swagger: ComplianceGridFilterDto
 */
export type GetAllCompliancesRequestDto = {
  pageNumber: number;
  pageSize: number;
  search?: string;
  jurisdiction?: string;
  status?: string;
};

/**
 * POST /api/v1/compliance-records
 * Swagger: AddComplianceDto
 */
export type AddComplianceRequestDto = {
  title: string;
  category: string;
  code: string;
  jurisdiction: string;
  regulatoryBody: string;
  dueDate: string;
  recurrence: string;
  responsiblePersonId: number;
  priority: string;
  evidenceUrls: string[];
};

/**
 * PUT /api/v1/compliance-records/{id} — mark complete (minimal payload).
 * All other fields fall back to stored values on the server.
 */
export type MarkCompleteComplianceRequestDto = Readonly<{
  id: number;
  markComplete: true;
}>;

/**
 * PUT /api/v1/compliance-records/{id}
 * Swagger: UpdateComplianceDto
 */
export type UpdateComplianceRequestDto = {
  id: number;
  code: string;
  title: string;
  category: string;
  jurisdiction: string;
  regulatoryBody: string;
  dueDate: string;
  nextDue: string;
  recurrence: string;
  responsiblePersonId: number;
  responsiblePerson: string;
  priority: string;
  status: string;
  completedDate: string;
  evidenceUrls: string[];
  markComplete: boolean;
};
