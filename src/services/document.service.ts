import type {
  AddDocCategoryRequestDto,
  AddDocDepartmentRequestDto,
  CreateDocumentRequestDto,
  GetAllDocumentsRequestDto,
} from "@/dtos/req/document-request.dto";
import type {
  DocCategoryDto,
  DocDepartmentDto,
  DocumentDto,
  GetAllDocumentsResultDto,
} from "@/dtos/res/document-response.dto";
import http from "@/lib/axios";

const DOCUMENT_GET_ALL_PATH = "/Document/allDocuments";
const DOCUMENT_CREATE_PATH = "/Document/document";
const DOCUMENT_ADD_CATEGORY_PATH = "/Document/AddCategory";
const DOCUMENT_ADD_DEPARTMENT_PATH = "/Document/AddDepartment";
const DOCUMENT_CATEGORIES_PATH = "/Document/GetAllCategories";
const DOCUMENT_DEPARTMENTS_PATH = "/Document/GetAllDepartments";

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
      asString(readProp(raw, "version", "Version", "currentVersion", "CurrentVersion")) ??
      null,
    currentVersion:
      asString(readProp(raw, "currentVersion", "CurrentVersion")) ?? null,
    code:
      asString(readProp(raw, "code", "Code", "documentCode", "DocumentCode")) ?? null,
    documentCode: asString(readProp(raw, "documentCode", "DocumentCode")) ?? null,
    site: asString(readProp(raw, "site", "Site")) ?? null,
    pdfUrl: asString(readProp(raw, "pdfUrl", "PdfUrl", "fileUrl", "FileUrl")) ?? null,
    fileUrl: asString(readProp(raw, "fileUrl", "FileUrl")) ?? null,
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
      readProp(raw, "acknowledged", "Acknowledged", "ackCount", "AckCount"),
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
      ),
    ),
    ackCount: asNumber(readProp(raw, "ackCount", "AckCount")),
    totalAck: asNumber(readProp(raw, "totalAck", "TotalAck")),
    reviewersDone: asNumber(readProp(raw, "reviewersDone", "ReviewersDone")),
    reviewersTotal: asNumber(readProp(raw, "reviewersTotal", "ReviewersTotal")),
    documentKind: asString(readProp(raw, "documentKind", "DocumentKind")) ?? null,
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
