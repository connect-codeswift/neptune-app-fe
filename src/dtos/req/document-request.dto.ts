/**
 * POST /api/v1/documents/search
 * Swagger: PaginationDto
 */
export type GetAllDocumentsRequestDto = {
  pageNumber: number;
  pageSize: number;
};

/**
 * Fields for POST /api/v1/documents (JSON body).
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
  siteId: number;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds: string;
  /** Comma-separated user ids for approvals. */
  approvalUserIds: string;
};

/**
 * Fields for POST /api/v1/documents/{documentId}/versions (JSON body).
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
 * Fields for PUT /api/v1/documents (JSON body).
 * Dedicated update endpoint — unlike the POST create endpoint, this one
 * takes `updatedBy` (not `createdBy`/`siteId`) and is meant to be
 * called with the document's existing `id`.
 */
export type UpdateDocumentRequestDto = {
  id: number;
  title: string;
  categoryId: number;
  departmentId: number;
  reviewCycle: string;
  updatedBy: number;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds: string;
  /** Comma-separated user ids for approvals. */
  approvalUserIds: string;
  pdfPath: string;
  fileName: string;
};

/**
 * PUT /api/v1/document-versions/{versionId}/acknowledge — sent as query-string param `docVersionId` only.
 * Backend reads the user from the auth token; no body or other params needed.
 */
export type AcknowledgeDocumentRequestDto = {
  docVersionId: number;
};

/**
 * PUT /api/v1/document-versions/{docVersionId}/approval (JSON body).
 */
export type ApproveDocumentRequestDto = {
  approverId: number;
  docVersionId: number;
  comments: string;
};

/**
 * POST /api/v1/document-categories
 * Swagger: AddDocCategoryDto — field name is intentionally `categorytName`.
 */
export type AddDocCategoryRequestDto = {
  categorytName: string;
};
