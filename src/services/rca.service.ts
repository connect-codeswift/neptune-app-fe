import type { CreateRcaCategoryRequestDto } from "@/dtos/req/rca-category-request.dto";
import type { RcaCategoryDto } from "@/dtos/res/rca-category-response.dto";
import http from "@/lib/axios";

const RCA_CATEGORIES_PATH = "/Rca/Categories";

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

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function unwrapPayload(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  return (
    data.dataModel ??
    data.DataModel ??
    data.data ??
    data.Data ??
    data.result ??
    data.Result ??
    data
  );
}

function coerceRcaCategory(
  raw: Record<string, unknown>,
): RcaCategoryDto | null {
  const id = readProp(raw, "id", "Id", "categoryId", "CategoryId");
  const name = asString(
    readProp(raw, "name", "Name", "label", "Label", "category", "Category"),
  );

  if ((typeof id !== "number" && typeof id !== "string") || !name) {
    return null;
  }

  return { id, name };
}

function normalizeRcaCategoryList(data: unknown): RcaCategoryDto[] {
  const payload = unwrapPayload(data);

  const list = Array.isArray(payload)
    ? payload
    : isRecord(payload)
      ? (payload.data ??
        payload.Data ??
        payload.items ??
        payload.Items ??
        payload.categories ??
        payload.Categories)
      : undefined;

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceRcaCategory(item))
    .filter((item): item is RcaCategoryDto => item != null);
}

function normalizeRcaCategory(data: unknown): RcaCategoryDto | null {
  const payload = unwrapPayload(data);

  if (isRecord(payload)) {
    const single = coerceRcaCategory(payload);
    if (single) {
      return single;
    }
  }

  const list = normalizeRcaCategoryList(data);
  return list[0] ?? null;
}

/** GET /Rca/Categories */
export async function getRcaCategories() {
  const { data } = await http.get<unknown>(RCA_CATEGORIES_PATH);
  return normalizeRcaCategoryList(data);
}

/** POST /Rca/Categories */
export async function createRcaCategory(payload: CreateRcaCategoryRequestDto) {
  const { data } = await http.post<unknown>(RCA_CATEGORIES_PATH, payload);
  return normalizeRcaCategory(data);
}
