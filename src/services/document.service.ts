import type {
  AcknowledgeDocumentRequestDto,
  AddDocCategoryRequestDto,
  ApproveDocumentRequestDto,
  CreateDocumentRequestDto,
  GetAllDocumentsRequestDto,
  UpdateDocumentRequestDto,
} from "@/dtos/req/document-request.dto";
import type {
  DocCategoryDto,
  DocumentDto,
  DocumentVersionDto,
  GetAllDocumentsResultDto,
  GetDocumentAcknowledgementsResponseDto,
  GetDocumentDashboardKpisResponseDto,
} from "@/dtos/res/document-response.dto";
import http, { HttpError } from "@/lib/axios";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto.ts";

const DOCUMENT_SEARCH_PATH = "/documents/search";
const DOCUMENT_PATH = "/documents";
const DOCUMENT_VERSIONS_PATH = "/document-versions";
const DOCUMENT_CATEGORIES_PATH = "/document-categories";
const DOCUMENT_DASHBOARD_KPIS_PATH = "/documents/dashboard-kpis";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

function asString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function coerceVersionDto(raw: Record<string, unknown>): DocumentVersionDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    versionNo: asNumber(readProp(raw, "versionNo", "VersionNo")),
    versionLabel:
      asString(readProp(raw, "versionLabel", "VersionLabel")) ?? null,
    status: asString(readProp(raw, "status", "Status")) ?? null,
    isCurrent: asBoolean(readProp(raw, "isCurrent", "IsCurrent")) ?? null,
    changeSummary:
      asString(readProp(raw, "changeSummary", "ChangeSummary")) ?? null,
    updatedByName:
      asString(readProp(raw, "updatedByName", "UpdatedByName")) ?? null,
    updatedAt: asString(readProp(raw, "updatedAt", "UpdatedAt")) ?? null,
    filePath: asString(readProp(raw, "filePath", "FilePath")) ?? null,
    fileName: asString(readProp(raw, "fileName", "FileName")) ?? null,
  };
}

function asVersionArray(value: unknown): DocumentVersionDto[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter(isRecord).map(coerceVersionDto);
}

function coerceDocumentDto(raw: Record<string, unknown>): DocumentDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    title: asString(readProp(raw, "title", "Title")) ?? null,
    categoryId: asNumber(readProp(raw, "categoryId", "CategoryId")),
    categoryName:
      asString(
        readProp(raw, "categoryName", "CategoryName", "category", "Category"),
      ) ?? null,
    category: asString(readProp(raw, "category", "Category")) ?? null,
    departmentId: asNumber(readProp(raw, "departmentId", "DepartmentId")),
    departmentName:
      asString(
        readProp(
          raw,
          "departmentName",
          "DepartmentName",
          "department",
          "Department",
        ),
      ) ?? null,
    department: asString(readProp(raw, "department", "Department")) ?? null,
    reviewCycle: asString(readProp(raw, "reviewCycle", "ReviewCycle")) ?? null,
    createdBy: asNumber(readProp(raw, "createdBy", "CreatedBy")),
    createdByName:
      asString(
        readProp(
          raw,
          "createdByName",
          "CreatedByName",
          "ownerName",
          "OwnerName",
        ),
      ) ?? null,
    ownerName:
      asString(readProp(raw, "ownerName", "OwnerName", "owner", "Owner")) ??
      null,
    owner: asString(readProp(raw, "owner", "Owner")) ?? null,
    siteId: asNumber(
      readProp(raw, "siteId", "SiteId", "subCompanyId", "SubCompanyId"),
    ),
    status: asString(readProp(raw, "status", "Status")) ?? null,
    version:
      asString(
        readProp(
          raw,
          "version",
          "Version",
          "currentVersion",
          "CurrentVersion",
          "versionLabel",
          "VersionLabel",
        ),
      ) ?? null,
    currentVersion:
      asString(readProp(raw, "currentVersion", "CurrentVersion")) ?? null,
    versionLabel:
      asString(readProp(raw, "versionLabel", "VersionLabel")) ?? null,
    versionNo: asNumber(readProp(raw, "versionNo", "VersionNo")),
    code:
      asString(readProp(raw, "code", "Code", "documentCode", "DocumentCode")) ??
      null,
    documentCode:
      asString(readProp(raw, "documentCode", "DocumentCode")) ?? null,
    site: asString(readProp(raw, "site", "Site")) ?? null,
    pdfUrl:
      asString(readProp(raw, "pdfUrl", "PdfUrl", "fileUrl", "FileUrl")) ?? null,
    fileUrl: asString(readProp(raw, "fileUrl", "FileUrl")) ?? null,
    pdfPath: asString(readProp(raw, "pdfPath", "PdfPath")) ?? null,
    fileName: asString(readProp(raw, "fileName", "FileName")) ?? null,
    fileType: asString(readProp(raw, "fileType", "FileType")) ?? null,
    fileSize: (() => {
      const rawSize = readProp(
        raw,
        "fileSize",
        "FileSize",
        "sizeBytes",
        "SizeBytes",
      );
      if (typeof rawSize === "number" && Number.isFinite(rawSize)) {
        return rawSize;
      }
      return asString(rawSize) ?? null;
    })(),
    expiresAt:
      asString(
        readProp(
          raw,
          "expiresAt",
          "ExpiresAt",
          "expiryDate",
          "ExpiryDate",
          "expires",
          "Expires",
        ),
      ) ?? null,
    expiryDate: asString(readProp(raw, "expiryDate", "ExpiryDate")) ?? null,
    expires: asString(readProp(raw, "expires", "Expires")) ?? null,
    reviewDate: asString(readProp(raw, "reviewDate", "ReviewDate")) ?? null,
    createdAt:
      asString(
        readProp(raw, "createdAt", "CreatedAt", "createdDate", "CreatedDate"),
      ) ?? null,
    updatedAt:
      asString(readProp(raw, "updatedAt", "UpdatedAt", "updated", "Updated")) ??
      null,
    updated: asString(readProp(raw, "updated", "Updated")) ?? null,
    acknowledged: asNumber(
      readProp(
        raw,
        "acknowledged",
        "Acknowledged",
        "ackCount",
        "AckCount",
        "acknowledgedCount",
        "AcknowledgedCount",
      ),
    ),
    acknowledgmentTotal: asNumber(
      readProp(
        raw,
        "acknowledgmentTotal",
        "AcknowledgmentTotal",
        "totalAck",
        "TotalAck",
        "ackTotal",
        "AckTotal",
        "acknowledgementTotal",
        "AcknowledgementTotal",
      ),
    ),
    ackCount: asNumber(readProp(raw, "ackCount", "AckCount")),
    totalAck: asNumber(readProp(raw, "totalAck", "TotalAck")),
    reviewersDone: asNumber(readProp(raw, "reviewersDone", "ReviewersDone")),
    reviewersTotal: asNumber(readProp(raw, "reviewersTotal", "ReviewersTotal")),
    documentKind:
      asString(readProp(raw, "documentKind", "DocumentKind")) ?? null,
    ackUserIds: asString(readProp(raw, "ackUserIds", "AckUserIds")) ?? null,
    approvalUserIds:
      asString(readProp(raw, "approvalUserIds", "ApprovalUserIds")) ?? null,
    versions: asVersionArray(readProp(raw, "versions", "Versions")),
  };
}

function asDocumentArray(value: unknown): DocumentDto[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord).map((item) => coerceDocumentDto(item));
}

function normalizeGetAllDocumentsResponse(
  data: unknown,
  request: GetAllDocumentsRequestDto,
): GetAllDocumentsResultDto {
  if (Array.isArray(data)) {
    const items = asDocumentArray(data);
    return {
      items,
      totalCount: items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  if (!isRecord(data)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  const dataModel = isRecord(data.dataModel)
    ? data.dataModel
    : isRecord(data.DataModel)
      ? data.DataModel
      : null;
  const nestedData = isRecord(data.data) ? data.data : null;
  const page = dataModel ?? nestedData;

  const items = asDocumentArray(
    (page &&
      (page.data ??
        page.Data ??
        page.items ??
        page.Items ??
        page.documents ??
        page.Documents)) ??
      data.items ??
      data.Items ??
      data.data ??
      data.result ??
      data.Result ??
      data.documents ??
      data.Documents ??
      data.Records,
  );

  const totalCountRaw =
    (page &&
      (page.totalRecords ??
        page.TotalRecords ??
        page.totalCount ??
        page.TotalCount ??
        page.total ??
        page.count)) ??
    data.totalCount ??
    data.TotalCount ??
    data.total ??
    data.count;
  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw =
    (page && (page.pageNumber ?? page.PageNumber)) ??
    data.pageNumber ??
    data.PageNumber;
  const pageSizeRaw =
    (page && (page.pageSize ?? page.PageSize)) ??
    data.pageSize ??
    data.PageSize;

  return {
    items,
    totalCount,
    pageNumber:
      typeof pageNumberRaw === "number" ? pageNumberRaw : request.pageNumber,
    pageSize: typeof pageSizeRaw === "number" ? pageSizeRaw : request.pageSize,
  };
}

/**
 * POST /api/v1/documents/search
 * body: `{ pageNumber, pageSize }`
 */
export async function getAllDocuments(request: GetAllDocumentsRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_SEARCH_PATH, request);
  return normalizeGetAllDocumentsResponse(data, request);
}

/** GET /api/v1/documents/dashboard-kpis */
export async function getDocumentDashboardKpis() {
  const { data } = await http.get<GetDocumentDashboardKpisResponseDto>(
    DOCUMENT_DASHBOARD_KPIS_PATH,
  );

  return data;
}

/** GET /api/v1/documents/category-stats */
/**
 * POST /api/v1/document-versions/{versionId}/acknowledge
 * Was `PUT /api/v1/document-versions/{versionId}/acknowledge?docVersionId=`; the v1 rename made it a
 * POST with the version id in the path. Backend still resolves the user from the
 * auth token. Throws on success: false so the mutation catches
 * not-assigned/bad-version cases.
 */
export async function acknowledgeDocument(
  payload: AcknowledgeDocumentRequestDto,
) {
  const { data } = await http.post<ApiEnvelopeDto<unknown>>(
    `${DOCUMENT_VERSIONS_PATH}/${String(payload.docVersionId)}/acknowledge`,
    null,
  );

  if (!data.success) {
    throw new HttpError({
      message:
        typeof data.message === "string" && data.message.length > 0
          ? data.message
          : "Acknowledgement failed.",
      status: data.statusCode,
      data,
    });
  }

  return data;
}

/** GET /api/v1/documents/{documentId}/versions */
export async function getDocumentVersions(
  documentId: number,
): Promise<DocumentVersionDto[]> {
  const { data } = await http.get<unknown>(
    `${DOCUMENT_PATH}/${String(documentId)}/versions`,
  );
  const list = unwrapListPayload(data);
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter(isRecord).map(coerceVersionDto);
}

/**
 * POST /api/v1/document-versions/{docVersionId}/approval
 *
 * BLOCKER — route-map.md maps this to `POST /api/v1/documents/{id}/approval`, but
 * there is no document id to put there: `DocApprovalDto`
 * (Neptune.Application/DTOs/Document/DocApprovalDto.cs) carries only
 * `ApproverId` + `docVersionId`, and its own comment says the approval row is
 * found by approver + version. Nested under the version here so the segment is
 * fillable. Backend must confirm before merge.
 *
 * Was `PUT /api/v1/document-versions/{docVersionId}/approval`.
 */
export async function approveDocument(payload: ApproveDocumentRequestDto) {
  const { data } = await http.post<unknown>(
    `${DOCUMENT_VERSIONS_PATH}/${String(payload.docVersionId)}/approval`,
    payload,
  );

  return data;
}

/** GET /api/v1/document-versions/{documentVersionId}/acknowledgements */
export async function getDocumentAcknowledgements(documentVersionId: number) {
  const { data } = await http.get<GetDocumentAcknowledgementsResponseDto>(
    `${DOCUMENT_VERSIONS_PATH}/${String(documentVersionId)}/acknowledgements`,
  );

  return data;
}

function hasDocumentId(value: Record<string, unknown>): boolean {
  return asNumber(readProp(value, "id", "Id")) != null;
}

function normalizeDocumentResponse(data: unknown): DocumentDto | null {
  if (isRecord(data) && hasDocumentId(data)) {
    return coerceDocumentDto(data);
  }

  if (!isRecord(data)) {
    return null;
  }

  const candidates = [
    data.dataModel,
    data.DataModel,
    data.data,
    data.Data,
    data.result,
    data.Result,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate) && hasDocumentId(candidate)) {
      return coerceDocumentDto(candidate);
    }
  }

  return null;
}

/**
 * GET /api/v1/documents/{id}
 * Returns a single document, or `null` if the backend has nothing for that id.
 */
export async function getDocumentById(id: number): Promise<DocumentDto | null> {
  const { data } = await http.get<unknown>(`${DOCUMENT_PATH}/${String(id)}`);
  return normalizeDocumentResponse(data);
}

function unwrapListPayload(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data;
  }
  if (!isRecord(data)) {
    return [];
  }
  const dataModel = readProp(data, "dataModel", "DataModel");
  if (Array.isArray(dataModel)) {
    return dataModel;
  }
  if (isRecord(dataModel)) {
    return (
      dataModel.data ??
      dataModel.Data ??
      dataModel.items ??
      dataModel.Items ??
      dataModel.result ??
      dataModel.Result ??
      []
    );
  }
  return (
    data.data ??
    data.Data ??
    data.items ??
    data.Items ??
    data.result ??
    data.Result ??
    data.categories ??
    data.Categories ??
    []
  );
}

function coerceCategoryDto(raw: Record<string, unknown>): DocCategoryDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    categoryId: asNumber(readProp(raw, "categoryId", "CategoryId")),
    categorytName:
      asString(readProp(raw, "categorytName", "CategorytName")) ?? null,
    categoryName:
      asString(readProp(raw, "categoryName", "CategoryName", "name", "Name")) ??
      null,
    name: asString(readProp(raw, "name", "Name")) ?? null,
  };
}

/** GET /api/v1/document-categories */
export async function getAllDocCategories(): Promise<DocCategoryDto[]> {
  const { data } = await http.get<unknown>(DOCUMENT_CATEGORIES_PATH);
  const list = unwrapListPayload(data);
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter(isRecord).map(coerceCategoryDto);
}

/**
 * POST /api/v1/document-categories
 * body: `{ categorytName }` (Swagger spelling)
 */
export async function addDocCategory(payload: AddDocCategoryRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_CATEGORIES_PATH, {
    categorytName: payload.categorytName.trim(),
  });
  return data;
}

/**
 * POST /api/v1/documents
 * JSON body — see CreateDocumentRequestDto. `pdfPath` must already be a
 * resolved Cloudinary URL (uploaded client-side before calling this).
 */
export async function createDocument(payload: CreateDocumentRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_PATH, {
    id: payload.id,
    title: payload.title,
    categoryId: payload.categoryId,
    departmentId: payload.departmentId,
    pdfPath: payload.pdfPath,
    fileName: payload.fileName,
    reviewCycle: payload.reviewCycle,
    createdBy: payload.createdBy,
    siteId: payload.siteId,
    ackUserIds: payload.ackUserIds,
    approvalUserIds: payload.approvalUserIds,
  });

  return data;
}

/**
 * PUT /api/v1/documents/{id}
 * JSON body — dedicated update endpoint (distinct from the POST create endpoint
 * above), takes `updatedBy` instead of `createdBy`/`siteId`. The id moved from
 * the body to the path in the v1 rename; it is still sent in the body, where the
 * backend now ignores it.
 */
export async function updateDocument(payload: UpdateDocumentRequestDto) {
  const { data } = await http.put<unknown>(
    `${DOCUMENT_PATH}/${String(payload.id)}`,
    {
      id: payload.id,
      title: payload.title,
      categoryId: payload.categoryId,
      departmentId: payload.departmentId,
      reviewCycle: payload.reviewCycle,
      updatedBy: payload.updatedBy,
      ackUserIds: payload.ackUserIds,
      approvalUserIds: payload.approvalUserIds,
      pdfPath: payload.pdfPath,
      fileName: payload.fileName,
    },
  );

  return data;
}

/**
 * POST /api/v1/documents/{documentId}/versions
 * JSON body — attaches a new PDF revision to an existing document.
 */
