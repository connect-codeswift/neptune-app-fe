"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDepartmentById,
  getDepartments,
} from "@/services/department.service";

/**
 * Keyed under "departments", not "documents". The register is its own resource —
 * it was only ever a document concern because that is where it happened to live.
 */
export const departmentQueryKeys = {
  all: ["departments"] as const,
  list: (search?: string) =>
    [...departmentQueryKeys.all, "list", search ?? ""] as const,
  detail: (id: number) => [...departmentQueryKeys.all, "detail", id] as const,
};

/** GET /api/v1/departments — the whole register, never paginated. */
export function useDepartmentsQuery(enabled = true, search?: string) {
  return useQuery({
    queryKey: departmentQueryKeys.list(search),
    queryFn: () => getDepartments(search),
    enabled,
  });
}

/** GET /api/v1/departments/{id} — for the register's own edit form. */
export function useDepartmentQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: departmentQueryKeys.detail(id),
    queryFn: () => getDepartmentById(id),
    enabled: enabled && id > 0,
  });
}
