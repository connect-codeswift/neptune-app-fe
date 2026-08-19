import { formatAge } from "@/lib/format-age";
import type { SelectOption } from "@/components/form-builder";
import type { MetricCardProps } from "@/components/ui/MetricCard";
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

/** Finite number when present, otherwise undefined. */
function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Normalizes GET /api/v1/hazards/kpis payload (camelCase or PascalCase).
 */
export function normalizeHazardKpiDto(raw: unknown): HazardKpiDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    totalHazards: asNumber(
      readProp(
        raw,
        "totalHazards",
        "TotalHazards",
        "totalHazardCount",
        "TotalHazardCount",
      ),
    ),
    totalHazardsDelta: asOptionalNumber(
      readProp(
        raw,
        "totalHazardsDelta",
        "TotalHazardsDelta",
        "totalHazardsChange",
        "TotalHazardsChange",
      ),
    ),
    hazardConvertedToIncidentCount: asNumber(
      readProp(
        raw,
        "hazardConvertedToIncidentCount",
        "HazardConvertedToIncidentCount",
        "convertedToIncidents",
        "ConvertedToIncidents",
      ),
    ),
    hazardConvertedToIncidentDelta: asOptionalNumber(
      readProp(
        raw,
        "hazardConvertedToIncidentDelta",
        "HazardConvertedToIncidentDelta",
        "hazardConvertedToIncidentChange",
        "HazardConvertedToIncidentChange",
      ),
    ),
  };
}

/**
 * Builds the two hazard KPI cards. The endpoint returns a period delta but no
 * series, so the cards pass `delta` straight through and draw no sparkline.
 */
export function mapHazardKpiToMetrics(
  dto: HazardKpiDto | null | undefined,
): readonly MetricCardProps[] {
  const totalDelta = dto?.totalHazardsDelta ?? dto?.totalHazardsChange;
  const convertedDelta =
    dto?.hazardConvertedToIncidentDelta ?? dto?.hazardConvertedToIncidentChange;

  return [
    {
      title: "Total hazard reports",
      value: dto?.totalHazards ?? 0,
      // More hazards reported is a healthier reporting culture, not a worse
      // site — the incidents they turn into are the metric that hurts.
      isMorePositive: true,
      delta: totalDelta,
      description: "Reported this period",
      icon: "mdi:alert-outline",
    },
    {
      title: "Converted to incidents",
      value: dto?.hazardConvertedToIncidentCount ?? 0,
      isMorePositive: false,
      delta: convertedDelta,
      description: "Hazards that became incidents",
      icon: "mdi:swap-horizontal",
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
    location,
    image: dto.image,
    relatedCapas: [],
  };
}
