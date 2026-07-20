import { z } from "zod";

/**
 * Matches backend `PagedTenantUserRequestDto` for
 * POST /api/Incident/GetAllIncidents
 *
 * Swagger example:
 * `{ "pageNumber": 0, "pageSize": 0, "subCompanyId": 0, "userId": 0 }`
 */
export const getAllIncidentsRequestSchema = z.object({
  pageNumber: z.number().int().nonnegative(),
  pageSize: z.number().int().nonnegative(),
  subCompanyId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
});

export type GetAllIncidentsRequestDto = z.infer<
  typeof getAllIncidentsRequestSchema
>;
