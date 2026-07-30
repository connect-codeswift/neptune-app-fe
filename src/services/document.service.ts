import type {
  AcknowledgeDocumentRequestDto,
  AddDocCategoryRequestDto,
  AddDocDepartmentRequestDto,
  CreateDocumentRequestDto,
  CreateDocumentVersionRequestDto,
  GetAllDocumentsRequestDto,
} from "@/dtos/req/document-request.dto";
import type {
  DocCategoryDto,
  DocDepartmentDto,
  DocumentDto,
  DocumentVersionDto,
  GetAllDocumentsResultDto,
  GetDocumentAcknowledgementsResponseDto,
  GetDocumentCategoryStatsResponseDto,
  GetDocumentDashboardKpisResponseDto,
} from "@/dtos/res/document-response.dto";
import http from "@/lib/axios";

const DOCUMENT_GET_ALL_PATH = "/Document/allDocuments";
const DOCUMENT_BY_ID_PATH = "/Document";
const DOCUMENT_CREATE_PATH = "/Document/document";
const DOCUMENT_VERSION_CREATE_PATH = "/Document/document_version";
const DOCUMENT_ADD_CATEGORY_PATH = "/Document/AddCategory";
const DOCUMENT_ADD_DEPARTMENT_PATH = "/Document/AddDepartment";
const DOCUMENT_CATEGORIES_PATH = "/Document/GetAllCategories";
const DOCUMENT_DEPARTMENTS_PATH = "/Document/GetAllDepartments";
const DOCUMENT_DASHBOARD_KPIS_PATH = "/Document/dashboard-kpis";
const DOCUMENT_CATEGORY_STATS_PATH = "/Document/category-stats";
const DOCUMENT_ACKNOWLEDGEMENT_PATH = "/Document/Acknowledgement";

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
    versionLabel: asString(readProp(raw, "versionLabel", "VersionLabel")) ?? null,
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
      asString(readProp(raw, "categoryName", "CategoryName", "category", "Category")) ??
      null,
    category: asString(readProp(raw, "category", "Category")) ?? null,
    departmentId: asNumber(readProp(raw, "departmentId", "DepartmentId")),
    departmentName:
      asString(
        readProp(raw, "departmentName", "DepartmentName", "department", "Department"),
      ) ?? null,
    department: asString(readProp(raw, "department", "Department")) ?? null,
    reviewCycle: asString(readProp(raw, "reviewCycle", "ReviewCycle")) ?? null,
    createdBy: asNumber(readProp(raw, "createdBy", "CreatedBy")),
    createdByName:
      asString(readProp(raw, "createdByName", "CreatedByName", "ownerName", "OwnerName")) ??
      null,
    ownerName: asString(readProp(raw, "ownerName", "OwnerName", "owner", "Owner")) ?? null,
    owner: asString(readProp(raw, "owner", "Owner")) ?? null,
    subCompanyId: asNumber(readProp(raw, "subCompanyId", "SubCompanyId")),
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
      asString(readProp(raw, "code", "Code", "documentCode", "DocumentCode")) ?? null,
    documentCode: asString(readProp(raw, "documentCode", "DocumentCode")) ?? null,
    site: asString(readProp(raw, "site", "Site")) ?? null,
    pdfUrl: asString(readProp(raw, "pdfUrl", "PdfUrl", "fileUrl", "FileUrl")) ?? null,
    fileUrl: asString(readProp(raw, "fileUrl", "FileUrl")) ?? null,
    pdfPath: asString(readProp(raw, "pdfPath", "PdfPath")) ?? null,
    fileName: asString(readProp(raw, "fileName", "FileName")) ?? null,
    fileType: asString(readProp(raw, "fileType", "FileType")) ?? null,
    fileSize: (() => {
      const rawSize = readProp(raw, "fileSize", "FileSize", "sizeBytes", "SizeBytes");
      if (typeof rawSize === "number" && Number.isFinite(rawSize)) {
        return rawSize;
      }
      return asString(rawSize) ?? null;
    })(),
    expiresAt:
      asString(
        readProp(raw, "expiresAt", "ExpiresAt", "expiryDate", "ExpiryDate", "expires", "Expires"),
      ) ?? null,
    expiryDate: asString(readProp(raw, "expiryDate", "ExpiryDate")) ?? null,
    expires: asString(readProp(raw, "expires", "Expires")) ?? null,
    reviewDate: asString(readProp(raw, "reviewDate", "ReviewDate")) ?? null,
    createdAt: asString(readProp(raw, "createdAt", "CreatedAt", "createdDate", "CreatedDate")) ?? null,
    updatedAt: asString(readProp(raw, "updatedAt", "UpdatedAt", "updated", "Updated")) ?? null,
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
    documentKind: asString(readProp(raw, "documentKind", "DocumentKind")) ?? null,
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
  return value
    .filter(isRecord)
    .map((item) => coerceDocumentDto(item));
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
    (page && (page.data ?? page.Data ?? page.items ?? page.Items ?? page.documents ?? page.Documents)) ??
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
 * POST /api/Document/allDocuments
 * body: `{ pageNumber, pageSize }`
 */
export async function getAllDocuments(request: GetAllDocumentsRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_GET_ALL_PATH, request);
  return normalizeGetAllDocumentsResponse(data, request);
}

/** GET /api/Document/dashboard-kpis */
export async function getDocumentDashboardKpis() {
  const { data } = await http.get<GetDocumentDashboardKpisResponseDto>(
    DOCUMENT_DASHBOARD_KPIS_PATH,
  );

  return data;
}

/** GET /api/Document/category-stats */
export async function getDocumentCategoryStats() {
  const { data } = await http.get<GetDocumentCategoryStatsResponseDto>(
    DOCUMENT_CATEGORY_STATS_PATH,
  );

  return data;
}

/**
 * PUT /api/Document/Acknowledgement
 * Query params only, no body — casing (`AckId`) matches Swagger exactly.
 */
export async function acknowledgeDocument(
  payload: AcknowledgeDocumentRequestDto,
) {
  const { data } = await http.put<unknown>(
    DOCUMENT_ACKNOWLEDGEMENT_PATH,
    null,
    {
      params: {
        acknowledgeBy: payload.acknowledgeBy,
        docVersionId: payload.docVersionId,
        AckId: payload.ackId,
      },
    },
  );

  return data;
}

/** GET /api/Document/versions/{documentVersionId}/acknowledgements */
export async function getDocumentAcknowledgements(documentVersionId: number) {
  const { data } = await http.get<GetDocumentAcknowledgementsResponseDto>(
    `/Document/versions/${String(documentVersionId)}/acknowledgements`,
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
 * GET /api/Document/{id}
 * Returns a single document, or `null` if the backend has nothing for that id.
 */
export async function getDocumentById(id: number): Promise<DocumentDto | null> {
  const { data } = await http.get<unknown>(
    `${DOCUMENT_BY_ID_PATH}/${String(id)}`,
  );
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
      asString(
        readProp(raw, "categoryName", "CategoryName", "name", "Name"),
      ) ?? null,
    name: asString(readProp(raw, "name", "Name")) ?? null,
  };
}

function coerceDepartmentDto(raw: Record<string, unknown>): DocDepartmentDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    departmentId: asNumber(readProp(raw, "departmentId", "DepartmentId")),
    departmentName:
      asString(
        readProp(raw, "departmentName", "DepartmentName", "name", "Name"),
      ) ?? null,
    name: asString(readProp(raw, "name", "Name")) ?? null,
  };
}

/** GET /api/Document/GetAllCategories */
export async function getAllDocCategories(): Promise<DocCategoryDto[]> {
  const { data } = await http.get<unknown>(DOCUMENT_CATEGORIES_PATH);
  const list = unwrapListPayload(data);
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter(isRecord).map(coerceCategoryDto);
}

/**
 * POST /api/Document/AddCategory
 * body: `{ categorytName }` (Swagger spelling)
 */
export async function addDocCategory(payload: AddDocCategoryRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_ADD_CATEGORY_PATH, {
    categorytName: payload.categorytName.trim(),
  });
  return data;
}

/** GET /api/Document/GetAllDepartments */
export async function getAllDocDepartments(): Promise<DocDepartmentDto[]> {
  const { data } = await http.get<unknown>(DOCUMENT_DEPARTMENTS_PATH);
  const list = unwrapListPayload(data);
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter(isRecord).map(coerceDepartmentDto);
}

/**
 * POST /api/Document/AddDepartment
 * body: `{ departmentName }`
 */
export async function addDocDepartment(payload: AddDocDepartmentRequestDto) {
  const { data } = await http.post<unknown>(DOCUMENT_ADD_DEPARTMENT_PATH, {
    departmentName: payload.departmentName.trim(),
  });
  return data;
}

function toCreateDocumentFormData(
  payload: CreateDocumentRequestDto,
): FormData {
  const formData = new FormData();
  formData.append("Id", String(payload.id));
  formData.append("Title", payload.title);
  formData.append("CategoryId", String(payload.categoryId));
  formData.append("DepartmentId", String(payload.departmentId));
  formData.append("PdfFile", payload.pdfFile, payload.pdfFile.name);
  formData.append("ReviewCycle", payload.reviewCycle);
  formData.append("CreatedBy", String(payload.createdBy));
  formData.append("SubCompanyId", String(payload.subCompanyId));
  formData.append("AckUserIds", payload.ackUserIds);
  formData.append("ApprovalUserIds", payload.approvalUserIds);
  return formData;
}

/**
 * POST /api/Document/document
 * multipart/form-data — see CreateDocumentRequestDto
 */
export async function createDocument(payload: CreateDocumentRequestDto) {
  const formData = toCreateDocumentFormData(payload);
  const { data } = await http.post<unknown>(DOCUMENT_CREATE_PATH, formData, {
    transformRequest: [
      (body, headers) => {
        // Drop the JSON default so the runtime can set multipart boundary.
        if (body instanceof FormData && headers) {
          delete headers["Content-Type"];
        }
        return body;
      },
    ],
  });
  return data;
}

function toCreateDocumentVersionFormData(
  payload: CreateDocumentVersionRequestDto,
): FormData {
  const formData = new FormData();
  if (payload.id != null) {
    formData.append("Id", String(payload.id));
  }
  formData.append("DocumentId", String(payload.documentId));
  formData.append("PdfFile", payload.pdfFile, payload.pdfFile.name);
  formData.append("UploadedBy", String(payload.uploadedBy));
  formData.append("AckUserIds", payload.ackUserIds);
  formData.append("ApprovalUserIds", payload.approvalUserIds);
  return formData;
}

/**
 * POST /api/Document/document_version
 * multipart/form-data — attaches a new PDF revision to an existing document.
 */
export async function createDocumentVersion(
  payload: CreateDocumentVersionRequestDto,
) {
  const formData = toCreateDocumentVersionFormData(payload);
  const { data } = await http.post<unknown>(
    DOCUMENT_VERSION_CREATE_PATH,
    formData,
    {
      transformRequest: [
        (body, headers) => {
          if (body instanceof FormData && headers) {
            delete headers["Content-Type"];
          }
          return body;
        },
      ],
    },
  );
  return data;
}
