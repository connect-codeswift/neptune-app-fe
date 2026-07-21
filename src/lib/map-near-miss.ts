import type { SelectOption } from "@/components/form-builder";
import type { CreateNearMissResponseDto } from "@/dtos/res/near-miss-response.dto";
import {
  CONTRIBUTING_FACTOR_OPTIONS,
  HAZARD_TYPE_OPTIONS,
  LOCATION_OPTIONS,
} from "@/components/near-miss/report/near-miss-report-schema";
import type {
  NearMissRecord,
  NearMissStatus,
} from "@/app/dashboard/near-miss/near-miss-data";

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

/** Whole hours between `dateOfEvent` and now, rendered as e.g. "36h". */
export function formatAgeInHours(dateOfEvent: string): string {
  const eventTime = new Date(dateOfEvent).getTime();

  if (Number.isNaN(eventTime)) {
    return "—";
  }

  const hours = Math.floor((Date.now() - eventTime) / (1000 * 60 * 60));

  return hours < 0 ? "0h" : `${hours}h`;
}

// Neither field exists on the backend response yet, so every mapped row gets
// the same placeholder. Remove these once the API returns them.
const PLACEHOLDER_STATUS: NearMissStatus = "Open";

export function mapNearMissDtoToRecord(
  dto: CreateNearMissResponseDto,
): NearMissRecord {
  return {
    id: String(dto.id ?? ""),
    title: dto.whatHappened,
    hazardType: labelFor(HAZARD_TYPE_OPTIONS, dto.hazardType),
    location: labelFor(LOCATION_OPTIONS, dto.location),
    site: `${dto.subCompanyId}`,
    reporter: `User ${dto.userId}`,
    status: PLACEHOLDER_STATUS,
    age: formatAgeInHours(dto.dateOfEvent),
    description: dto.whatHappened,
    dateOfEvent: dto.dateOfEvent,
    contributingFactors: dto.contributingFactor.map((factor) =>
      labelFor(CONTRIBUTING_FACTOR_OPTIONS, factor),
    ),
    relatedCapas: [],
  };
}
