/**
 * POST /api/Document/allDocuments
 * Swagger: PaginationDto
 */
export type GetAllDocumentsRequestDto = {
  pageNumber: number;
  pageSize: number;
};

/**
 * Fields for POST /api/Document/document (JSON body).
 * The PDF is uploaded to Cloudinary client-side first; this call only sends
 * the resulting URL (`pdfPath`) and the original filename (`fileName`) —
 * no binary upload happens against this endpoint anymore.
 */
export type CreateDocumentRequestDto = {
  id: number;
  title: string;
  categoryId: number;
  departmentId: number;
  pdfPath: string;
  fileName: string;
  reviewCycle: string;
  createdBy: number;
  subCompanyId: number;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds: string;
  /** Comma-separated user ids for approvals. */
  approvalUserIds: string;
};

/**
 * Fields for POST /api/Document/document_version (JSON body).
 * Attaches a new PDF revision to an existing document — no title/category/
 * department/reviewCycle fields exist on this endpoint. Same as
 * CreateDocumentRequestDto, `pdfPath` is a pre-uploaded Cloudinary URL.
 */
export type CreateDocumentVersionRequestDto = {
  /** Omit to let the backend assign a new version id. */
  id?: number;
  documentId: number;
  pdfPath: string;
  fileName: string;
  uploadedBy: number;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds: string;
  /** Comma-separated user ids for approvals. */
  approvalUserIds: string;
};

/**
 * PUT /api/Document/Acknowledgement — sent as query-string params
 * (`acknowledgeBy`, `docVersionId`, `AckId` — casing per Swagger).
 */
export type AcknowledgeDocumentRequestDto = {
  acknowledgeBy: number;
  docVersionId: number;
  ackId: number;
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
