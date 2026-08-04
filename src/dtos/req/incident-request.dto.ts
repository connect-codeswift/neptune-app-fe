import { z } from "zod";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

/**
 * Matches backend `IncidentGridFilterDto` for
 * POST /api/Incident/GetAllIncidents
 *
 * Tenant scope comes from the JWT — do not send siteId or userId here.
 */
export const getAllIncidentsRequestSchema = z.object({
  pageNumber: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  /** Substring match on incident description / location. */
  search: z.string().optional(),
  /** Workflow stage filter (e.g. "Investigating", "Closed"). */
  stage: z.string().optional(),
  /** Severity label filter. */
  severity: z.string().optional(),
  /** Site name filter. */
  site: z.string().optional(),
});

export type GetAllIncidentsRequestDto = z.infer<
  typeof getAllIncidentsRequestSchema
>;

/** Request body for POST /api/Incident/incident. */
export type CreateIncidentRequestDto = IncidentDto;

/**
 * Request body for PUT /api/Incident/UpdateIncident/{id}.
 * Same shape as create payload.
 */
export type UpdateIncidentRequestDto = IncidentDto;

/** Tenant context on drop / scoped mutations (`TenantUserContextDto`). */
export const tenantUserContextSchema = z.object({
  siteId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
});

export type TenantUserContextDto = z.infer<typeof tenantUserContextSchema>;
