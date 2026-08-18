import { formatAge } from "@/lib/format-age";
import type { SelectOption } from "@/components/form-builder";
import type { MetricCardProps } from "@/components/ui/MetricCard";
import type {
  CreateNearMissResponseDto,
  NearMissKpiDto,
} from "@/dtos/res/near-miss-response.dto";
import {
  CONTRIBUTING_FACTOR_OPTIONS,
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/near-miss/report/near-miss-report-schema";
import type {
  NearMissRecord,
  NearMissStatus,
} from "@/app/dashboard/near-miss/near-miss-data";
import {
  asNumber,
  isRecord,
  readProp,
} from "@/services/mappers/record-readers";

/**
 * The backend stores hazard type / location / contributing factors as slugs
 * ("plant-a-line-2"). Reuse the report form's option lists so the table shows
 * the same labels the reporter picked from.
 */
function labelFor(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * Display form of a record id, e.g. `3` -> "NM-3". Ids that already carry the
 * prefix (the static mock records) are passed through untouched.
 */
export function formatNearMissDisplayId(id: string): string {
  return id.startsWith("NM-") ? id : `NM-${id}`;
}

/** Strip the display prefix back off, e.g. "NM-3" -> "3", for API calls. */
export function toNearMissApiId(displayId: string): string {
  return displayId.replace(/^NM-/i, "");
}

export { formatAge };

const NEAR_MISS_STATUSES: readonly NearMissStatus[] = [
  "Open",
  "Investigating",
  "Closed",
];

/** Older records come back with a null status; treat those as still open. */
function toStatus(value: string | null | undefined): NearMissStatus {
  if (!value) return "Open";

  return (
    NEAR_MISS_STATUSES.find(
      (status) => status.toLowerCase() === value.trim().toLowerCase(),
    ) ?? "Open"
  );
}

export function mapNearMissDtoToRecord(
  dto: CreateNearMissResponseDto,
): NearMissRecord {
  return {
    id: String(dto.id ?? ""),
    title: dto.whatHappened,
    hazardType: labelFor(HAZARD_TYPE_OPTIONS, dto.hazardType),
    location: labelFor(LOCATION_OPTIONS, dto.location),
    site: `${dto.siteId}`,
    // Placeholder until the caller resolves the id against /User/dropdown.
    reporter: `User ${String(dto.userId)}`,
    reporterId: dto.userId,
    status: toStatus(dto.status),
    // Age counts from when the report was filed, falling back to the event date
    // for records created before the API returned `createdAt`.
    age: formatAge(dto.createdAt ?? dto.dateOfEvent),
    description: dto.whatHappened,
    dateOfEvent: dto.dateOfEvent,
    contributingFactors: dto.contributingFactor.map((factor) =>
      labelFor(CONTRIBUTING_FACTOR_OPTIONS, factor),
    ),
    relatedCapas: [],
  };
}

/** Finite number when present, otherwise undefined (so missing deltas stay hidden). */
function asOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Normalizes GET /api/NearMiss/NearMissKpi (camelCase or PascalCase).
 */
export function normalizeNearMissKpiDto(raw: unknown): NearMissKpiDto | null {
  if (!isRecord(raw)) return null;

  return {
    totalNearMissCount: asNumber(
      readProp(
        raw,
        "totalNearMissCount",
        "TotalNearMissCount",
        "totalNearMisses",
        "TotalNearMisses",
        "total",
        "Total",
      ),
    ),
    totalNearMissDelta: asOptionalNumber(
      readProp(
        raw,
        "totalNearMissDelta",
        "TotalNearMissDelta",
        "totalNearMissChange",
        "TotalNearMissChange",
      ),
    ),
    convertedToIncidents: asNumber(
      readProp(
        raw,
        "convertedToIncidents",
        "ConvertedToIncidents",
        "convertedIncidents",
        "ConvertedIncidents",
        "converted",
        "Converted",
      ),
    ),
    convertedToIncidentsDelta: asOptionalNumber(
      readProp(
        raw,
        "convertedToIncidentsDelta",
        "ConvertedToIncidentsDelta",
        "convertedToIncidentsChange",
        "ConvertedToIncidentsChange",
      ),
    ),
  };
}

/**
 * Builds the two near-miss KPI cards. The endpoint returns a period delta but
 * no series, so the cards pass `delta` straight through and draw no sparkline.
 */
export function mapNearMissKpiToMetrics(
  dto: NearMissKpiDto | null | undefined,
): readonly MetricCardProps[] {
  const totalDelta = dto?.totalNearMissDelta ?? dto?.totalNearMissChange;
  const convertedDelta =
    dto?.convertedToIncidentsDelta ?? dto?.convertedToIncidentsChange;

  return [
    {
      title: "Total near misses",
      value: dto?.totalNearMissCount ?? dto?.totalNearMisses ?? dto?.total ?? 0,
      // Reporting more near misses is the goal, not the problem.
      isMorePositive: true,
      delta: totalDelta,
      description: "Reported this period",
      icon: "mdi:alert-decagram-outline",
    },
    {
      title: "Converted to incidents",
      value:
        dto?.convertedToIncidents ??
        dto?.convertedIncidents ??
        dto?.converted ??
        0,
      isMorePositive: false,
      delta: convertedDelta,
      description: "Near misses that became incidents",
      icon: "mdi:swap-horizontal",
    },
  ];
}
