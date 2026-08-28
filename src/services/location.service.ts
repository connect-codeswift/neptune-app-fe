import type { LocationDto } from "@/dtos/res/location-response.dto";
import http from "@/lib/axios";

const LOCATIONS_PATH = "/locations";

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

function coerceLocation(raw: Record<string, unknown>): LocationDto {
  return {
    id: asNumber(readProp(raw, "id", "Id")),
    name: asString(readProp(raw, "name", "Name")),
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

/** GET /api/v1/locations?search= — `Location.View`. Not paginated. */
export async function getLocations(search?: string): Promise<LocationDto[]> {
  const { data } = await http.get<unknown>(LOCATIONS_PATH, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return unwrapList(data)
    .filter(isRecord)
    .map(coerceLocation)
    .filter((location) => location.name.trim() !== "");
}
