import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto.ts";

/**
 * One entry in the site's department register.
 *
 * GET /api/v1/departments — see neptune-be/FEGuides/Departments.md
 *
 * Was `DocDepartmentDto` with `{ id, departmentName, siteId }` while the register
 * lived inside the document module. `siteId` is gone from the wire: the list is
 * already scoped to your site and you could never have sent a different one.
 */
export type DepartmentDto = {
  id: number;
  name: string;
};

export type GetDepartmentsResponseDto = ApiEnvelopeDto<DepartmentDto[] | null>;

export type GetDepartmentByIdResponseDto = ApiEnvelopeDto<DepartmentDto | null>;
