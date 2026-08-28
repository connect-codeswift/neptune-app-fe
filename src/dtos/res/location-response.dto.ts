import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto.ts";

/**
 * One entry in the site's location register.
 *
 * GET /api/v1/locations — `Location.View`, held by Worker and Supervisor as well as
 * Ehs_Director, so a reporter filling in an incident can read the list.
 *
 * The register is the promoted form of the old LOTO-only location list; the incident
 * form used to offer a hardcoded set of plant areas instead, which meant a site's real
 * locations and the ones an incident could be filed against were unrelated lists.
 */
export type LocationDto = {
  id: number;
  name: string;
};

export type GetLocationsResponseDto = ApiEnvelopeDto<LocationDto[] | null>;

export type GetLocationByIdResponseDto = ApiEnvelopeDto<LocationDto | null>;
