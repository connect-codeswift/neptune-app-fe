import { z } from "zod";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

/**
 * Matches backend `PagedTenantUserRequestDto` for
 * POST /api/Incident/GetAllIncidents
 *
 * Staging API behavior (Swagger example values are misleading):
 * - `pageNumber` is 1-based (`0` → negative SQL OFFSET / 400)
 * - `pageSize` must be > 0 (`0` → empty `data` with non-zero `totalRecords`)
 *
 * `search` / `severity` / `caseDisposition` are optional server-side filters.
 * They are omitted from the request body when unset, and an older backend that
 * does not know them simply ignores them — the list still re-filters client-side.
 */
export const getAllIncidentsRequestSchema = z.object({
  pageNumber: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  subCompanyId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
  /** Substring match on incident description / location. */
  search: z.string().optional(),
  /** Exact match on the stored severity label (e.g. "OSHA Recordable"). */
  severity: z.string().optional(),
  /** Exact match on the stored case disposition label. */
  caseDisposition: z.string().optional(),
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
