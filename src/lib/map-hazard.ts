import { formatAge } from "@/lib/format-age";
import type { SelectOption } from "@/components/form-builder";
import type { HazardDto, HazardKpiDto } from "@/dtos/res/hazard-response.dto";
import {
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/hazard/report/hazard-report-schema";
import type {
  HazardRecord,
  HazardStage,
  HazardStatus,
} from "@/app/dashboard/hazard/hazard-data";
import {
  asNumber,
  isRecord,
  readProp,
} from "@/services/mappers/record-readers";

/**
 * Normalizes GET /api/Hazard/HazardKpiCount payload (camelCase or PascalCase).
 */
export function normalizeHazardKpiDto(raw: unknown): HazardKpiDto | null {  if (!isRecord(raw)) {
    return null;
  }

  const totalHazards =
    asNumber(
      readProp(
        raw,
        "totalHazards",
        "TotalHazards",
        "totalHazardCount",
        "TotalHazardCount",
      ),
    ) ?? 0;

  const hazardConvertedToIncidentCount =
    asNumber(
      readProp(
        raw,
        "hazardConvertedToIncidentCount",
        "HazardConvertedToIncidentCount",
        "convertedToIncidents",
        "ConvertedToIncidents",
      ),
    ) ?? 0;

  return { totalHazards, hazardConvertedToIncidentCount };
}

/** Builds the two hazard dashboard KPI cards from the API payload. */
export function mapHazardKpiToMetrics(
  dto: HazardKpiDto | null | undefined,
): readonly { title: string; value: number }[] {
  return [
    {
      title: "Total hazards reports",
      value: dto?.totalHazards ?? 0,
    },
    {
      title: "Converted to incidents",
      value: dto?.hazardConvertedToIncidentCount ?? 0,
    },
  ];
}

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

export { formatAge };

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
    reporterId: dto.userId,
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
