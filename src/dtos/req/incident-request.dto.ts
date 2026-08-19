import type { IncidentDto } from "@/dtos/res/incident-response.dto";

/**
 * Matches backend `IncidentGridFilterDto` for
 * POST /api/v1/incidents/search
 *
 * Tenant scope comes from the JWT — do not send siteId or userId here.
 */
export type GetAllIncidentsRequestDto = {
  pageNumber: number;
  pageSize: number;
  /** Substring match on incident description / location. */
  search?: string;
  /** Severity label filter. */
  severity?: string;
  /** Site name filter. */
  site?: string;
};

/**
 * Incident write payload.
 *
 * `siteId` / `userId` are omitted rather than optional: the server stamps both
 * from the JWT and silently overwrites whatever is sent, so a stale value in a
 * payload is invisible at runtime — no 400 to catch it. Omitting them at the
 * type level is what makes the compiler the thing that catches it instead.
 *
 * `reportedById` stays — it is a business field (who filed the report), not
 * tenant context.
 */
export type IncidentWritePayloadDto = Omit<IncidentDto, "siteId" | "userId">;

/** Request body for POST /api/v1/incidents. */
export type CreateIncidentRequestDto = IncidentWritePayloadDto;

/**
 * Request body for PUT /api/v1/incidents/{id}.
 * Same shape as create payload.
 */
export type UpdateIncidentRequestDto = IncidentWritePayloadDto;

/**
 * Tenant context on scoped mutations (`TenantUserContextDto`).
 *
 * No longer used by Incident — the JWT carries it. Rca and Hazard still take
 * it, so the type stays.
 */
export type TenantUserContextDto = {
  siteId: number;
  userId: number;
};
