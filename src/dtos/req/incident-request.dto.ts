import type { IncidentDto } from "@/dtos/res/incident-response.dto";

/**
 * Matches backend `IncidentGridFilterDto` for
 * POST /api/Incident/GetAllIncidents
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

/** Request body for POST /api/Incident/incident. */
export type CreateIncidentRequestDto = IncidentDto;

/**
 * Request body for PUT /api/Incident/UpdateIncident/{id}.
 * Same shape as create payload.
 */
export type UpdateIncidentRequestDto = IncidentDto;

/** Tenant context on drop / scoped mutations (`TenantUserContextDto`). */
export type TenantUserContextDto = {
  siteId: number;
  userId: number;
};
