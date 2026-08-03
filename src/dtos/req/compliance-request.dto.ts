/**
 * POST /api/Compliance/GetAllCompliances
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
 * POST /api/Compliance/AddCompliance
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
 * PUT /api/Compliance/Update
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
