import { z } from "zod";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

/**
 * Matches backend `PagedTenantUserRequestDto` for
 * POST /api/Incident/GetAllIncidents
 *
 * Staging API behavior (Swagger example values are misleading):
 * - `pageNumber` is 1-based (`0` → negative SQL OFFSET / 400)
 * - `pageSize` must be > 0 (`0` → empty `data` with non-zero `totalRecords`)
 */
export const getAllIncidentsRequestSchema = z.object({
  pageNumber: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  subCompanyId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
});

export type GetAllIncidentsRequestDto = z.infer<
  typeof getAllIncidentsRequestSchema
>;

/** Request body for POST /api/Incident/incident (`IncidentDto`). */
export type CreateIncidentRequestDto = IncidentDto;

/**
 * Request body for PUT /api/Incident/UpdateIncident/{id}.
 * Same shape as `IncidentDto` / create payload.
 */
export type UpdateIncidentRequestDto = IncidentDto;

/** Tenant context used by incident close/update calls. */
export const tenantUserContextSchema = z.object({
  subCompanyId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
});

export type TenantUserContextDto = z.infer<typeof tenantUserContextSchema>;
