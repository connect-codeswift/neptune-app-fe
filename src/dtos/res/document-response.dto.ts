import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** Version row nested on GET /api/Document/{id} (and possibly allDocuments). */
export type DocumentVersionDto = {
  id?: number | null;
  versionNo?: number | null;
  versionLabel?: string | null;
  status?: string | null;
  isCurrent?: boolean | null;
  changeSummary?: string | null;
  updatedByName?: string | null;
  updatedAt?: string | null;
  filePath?: string | null;
  /** Original uploaded filename (backend field added after the earlier ask — currently null on older docs). */
  fileName?: string | null;
};

/**
 * Document row from POST /api/Document/allDocuments.
 * Backend field names vary (camelCase / PascalCase); the service coerces them.
 */
export type DocumentDto = {
  id?: number;
  title?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  category?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  department?: string | null;
  reviewCycle?: string | null;
  createdBy?: number | null;
  createdByName?: string | null;
  ownerName?: string | null;
  owner?: string | null;
  subCompanyId?: number | null;
  status?: string | null;
  version?: string | null;
  currentVersion?: string | null;
  versionLabel?: string | null;
  versionNo?: number | null;
  code?: string | null;
  documentCode?: string | null;
  site?: string | null;
  pdfUrl?: string | null;
  fileUrl?: string | null;
  pdfPath?: string | null;
  /** Original uploaded filename (backend field added after the earlier ask — currently null on older docs). */
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: string | number | null;
  expiresAt?: string | null;
  expiryDate?: string | null;
  expires?: string | null;
  reviewDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  updated?: string | null;
  acknowledged?: number | null;
  acknowledgmentTotal?: number | null;
  ackCount?: number | null;
  totalAck?: number | null;
  reviewersDone?: number | null;
  reviewersTotal?: number | null;
  documentKind?: string | null;
  /** Comma-separated user ids for acknowledgment tracking. */
  ackUserIds?: string | null;
  /** Comma-separated user ids for approvals. */
  approvalUserIds?: string | null;
  versions?: DocumentVersionDto[] | null;
};

/** Normalized list payload used by the document service. */
export type GetAllDocumentsResultDto = {
  items: DocumentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

/** Typed envelope if the backend returns the standard wrapper. */
export type GetAllDocumentsResponseDto = ApiEnvelopeDto<
  PagedDataDto<DocumentDto>
>;

/** Category row from GET /api/Document/GetAllCategories. */
export type DocCategoryDto = {
  id?: number;
  categoryId?: number;
  /** Swagger AddDocCategoryDto uses this typo. */
  categorytName?: string | null;
  categoryName?: string | null;
  name?: string | null;
};

/** Department row from GET /api/Document/GetAllDepartments. */
export type DocDepartmentDto = {
  id?: number;
  departmentId?: number;
  departmentName?: string | null;
  name?: string | null;
};

export type GetAllDocCategoriesResponseDto = ApiEnvelopeDto<
  DocCategoryDto[] | null
>;

export type GetAllDocDepartmentsResponseDto = ApiEnvelopeDto<
  DocDepartmentDto[] | null
>;

export type CreateDocumentResponseDto = ApiEnvelopeDto<DocumentDto | null>;

/** Envelope shape for GET /api/Document/{id}. */
export type GetDocumentByIdResponseDto = ApiEnvelopeDto<DocumentDto | null>;

/** dataModel shape for GET /api/Document/dashboard-kpis. */
export type DocumentDashboardKpisDto = {
  activeDocs?: number | null;
  pendingReview?: number | null;
  expiringIn30Days?: number | null;
  acknowledgementRate?: number | null;
};

export type GetDocumentDashboardKpisResponseDto =
  ApiEnvelopeDto<DocumentDashboardKpisDto | null>;

/** One entry of GET /api/Document/category-stats. */
export type DocumentCategoryStatDto = {
  category?: string | null;
  totalCount?: number | null;
};

export type GetDocumentCategoryStatsResponseDto = ApiEnvelopeDto<
  DocumentCategoryStatDto[] | null
>;

/** One row of GET /api/Document/versions/{documentVersionId}/acknowledgements. */
export type DocumentAcknowledgementRowDto = {
  id?: number | null;
  name?: string | null;
  department?: string | null;
  status?: string | null;
  acknowledgedDate?: string | null;
};

/** dataModel shape for GET /api/Document/versions/{documentVersionId}/acknowledgements. */
export type DocumentAcknowledgementsDto = {
  acknowledgedCount?: number | null;
  pendingCount?: number | null;
  completionRate?: number | null;
  rows?: DocumentAcknowledgementRowDto[] | null;
};

export type GetDocumentAcknowledgementsResponseDto = ApiEnvelopeDto<
  DocumentAcknowledgementsDto | null
>;
