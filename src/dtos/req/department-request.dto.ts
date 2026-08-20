/**
 * POST /api/v1/departments
 *
 * Was `{ departmentName }` while the register lived inside the document module.
 * Names are unique per site, case-insensitively — a duplicate is a 400, not a
 * silently accepted second row.
 */
export type CreateDepartmentRequestDto = {
  name: string;
};

/** PUT /api/v1/departments/{id} — same body, same uniqueness rule. */
export type UpdateDepartmentRequestDto = {
  name: string;
};
