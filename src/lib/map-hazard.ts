import type { SelectOption } from "@/components/form-builder";
import type { HazardDto } from "@/dtos/res/hazard-response.dto";
import {
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/hazard/report/hazard-report-schema";
import type {
  HazardRecord,
  HazardStage,
  HazardStatus,
} from "@/app/dashboard/hazard/hazard-data";

/**
 * The backend stores type / location as slugs ("warehouse-1"). Reuse the
 * report form's option lists so the table shows the label the reporter picked.
 */
function labelFor(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Display form of a record id, e.g. `1` -> "HZ-1". */
export function formatHazardDisplayId(id: number | string): string {
  const raw = String(id);
  return raw.startsWith("HZ-") ? raw : `HZ-${raw}`;
}

/** Strip the display prefix back off, e.g. "HZ-1" -> "1", for API calls. */
export function toHazardApiId(displayId: string): string {
  return displayId.replace(/^HZ-/i, "");
}

/**
 * Age since creation, e.g. "45m" / "6h" / "3d". The backend sends a naive
 * timestamp (no offset), which .NET writes in UTC — parse it as such.
 */
export function formatAge(createdDate: string): string {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(createdDate);
  const created = new Date(hasZone ? createdDate : `${createdDate}Z`).getTime();

  if (Number.isNaN(created)) return "—";

  const minutes = Math.floor((Date.now() - created) / (1000 * 60));
  if (minutes < 1) return "0m";
  if (minutes < 60) return `${String(minutes)}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h`;

  return `${String(Math.floor(hours / 24))}d`;
}

const HAZARD_STATUSES: readonly HazardStatus[] = [
  "Open",
  "Investigating",
  "Closed",
];

function toStatus(value: string): HazardStatus {
  return (
    HAZARD_STATUSES.find(
      (status) => status.toLowerCase() === value.trim().toLowerCase(),
    ) ?? "Open"
  );
}

/** Workflow stage implied by the list status, until the API returns one. */
const STAGE_BY_STATUS: Record<HazardStatus, HazardStage> = {
  Open: "Reported",
  Investigating: "Assessed",
  Closed: "Closed",
};

export function mapHazardDtoToRecord(dto: HazardDto): HazardRecord {
  const status = toStatus(dto.status);
  const type = labelFor(HAZARD_TYPE_OPTIONS, dto.type);
  const location = labelFor(LOCATION_OPTIONS, dto.location);

  return {
    id: formatHazardDisplayId(dto.id),
    title: dto.description,
    reporter: `User ${String(dto.userId)}`,
    site: location,
    // The API carries no severity yet; the detail view falls back to this.
    severity: "Medium",
    status,
    age: formatAge(dto.createdDate),
    stage: STAGE_BY_STATUS[status],
    hazardType: type,
    category: type,
    description: dto.description,
    dateReported: dto.createdDate.slice(0, 10),
    assignedTo:
      dto.assignedTo === 0 ? "Unassigned" : `User ${String(dto.assignedTo)}`,
    assignedToId: dto.assignedTo,
    location,
    image: dto.image,
    relatedCapas: [],
  };
}
