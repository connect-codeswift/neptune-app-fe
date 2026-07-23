/**
 * POST /api/Document/allDocuments
 * Swagger: PaginationDto
 */
export type GetAllDocumentsRequestDto = {
  pageNumber: number;
  pageSize: number;
};

/**
 * Fields for POST /api/Document/document (multipart/form-data).
 * Sent as FormData with PascalCase keys matching Swagger.
 */
export type CreateDocumentRequestDto = {
  id: number;
  title: string;
  categoryId: number;
  departmentId: number;
  pdfFile: File;
  reviewCycle: string;
  createdBy: number;
  subCompanyId: number;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds: string;
  /** Comma-separated user ids for approvals. */
  approvalUserIds: string;
};

/**
 * POST /api/Document/AddCategory
 * Swagger: AddDocCategoryDto — field name is intentionally `categorytName`.
 */
export type AddDocCategoryRequestDto = {
  categorytName: string;
};

/**
 * POST /api/Document/AddDepartment
 * Swagger: AddDocDepartmentDto
 */
export type AddDocDepartmentRequestDto = {
  departmentName: string;
};
