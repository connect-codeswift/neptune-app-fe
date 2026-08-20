import type {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from "@/dtos/req/department-request.dto";
import type { DepartmentDto } from "@/dtos/res/department-response.dto";
import http from "@/lib/axios";

const DEPARTMENTS_PATH = "/departments";

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

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * The register still answers `departmentName` on any deployment that predates the
 * promotion, so both spellings are read. Drop the fallbacks once every environment
 * serves `Departments.md`'s shape.
 */
function coerceDepartment(raw: Record<string, unknown>): DepartmentDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    name: asString(
      readProp(raw, "name", "Name", "departmentName", "DepartmentName"),
    ),
  };
}

function unwrapList(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (!isRecord(data)) {
    return [];
  }
  const dataModel = readProp(data, "dataModel", "DataModel");
  return Array.isArray(dataModel) ? dataModel : [];
}

function unwrapOne(data: unknown): DepartmentDto | null {
  if (!isRecord(data)) {
    return null;
  }
  const dataModel = readProp(data, "dataModel", "DataModel");
  return isRecord(dataModel) ? coerceDepartment(dataModel) : null;
}

/** GET /api/v1/departments?search= — `Department.View`. Not paginated. */
export async function getDepartments(
  search?: string,
): Promise<DepartmentDto[]> {
  const { data } = await http.get<unknown>(DEPARTMENTS_PATH, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return unwrapList(data).filter(isRecord).map(coerceDepartment);
}

/** GET /api/v1/departments/{id} — `Department.View`. 404 for another site's row. */
export async function getDepartmentById(
  id: number,
): Promise<DepartmentDto | null> {
  const { data } = await http.get<unknown>(`${DEPARTMENTS_PATH}/${id}`);
  return unwrapOne(data);
}

/** POST /api/v1/departments — `Department.Manage`. Duplicate name is a 400. */
export async function addDepartment(payload: CreateDepartmentRequestDto) {
  const { data } = await http.post<unknown>(DEPARTMENTS_PATH, {
    name: payload.name.trim(),
  });
  return data;
}

/** PUT /api/v1/departments/{id} — `Department.Manage`. */
export async function updateDepartment(
  id: number,
  payload: UpdateDepartmentRequestDto,
) {
  const { data } = await http.put<unknown>(`${DEPARTMENTS_PATH}/${id}`, {
    name: payload.name.trim(),
  });
  return data;
}

/**
 * DELETE /api/v1/departments/{id} — `Department.Manage`.
 *
 * Soft delete and it always succeeds. The row survives and every document keeps
 * resolving its department's name; it only leaves the pickers. Confirmation copy
 * should say "stop offering this department", not "this cannot be undone".
 */
export async function dropDepartment(id: number) {
  const { data } = await http.delete<unknown>(`${DEPARTMENTS_PATH}/${id}`);
  return data;
}
