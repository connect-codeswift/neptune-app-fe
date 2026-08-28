"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from "@/dtos/req/department-request.dto";
import {
  addDepartment,
  dropDepartment,
  updateDepartment,
} from "@/services/department.service";
import { departmentQueryKeys } from "@/hooks/use-department-queries";

/** POST /api/v1/departments — refreshes the register after create. */
export function useAddDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentRequestDto) => addDepartment(payload),
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: departmentQueryKeys.all,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

/** PUT /api/v1/departments/{id} — a rename every document follows, by id. */
export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id: number; payload: UpdateDepartmentRequestDto }) =>
      updateDepartment(vars.id, vars.payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
  });
}

/**
 * DELETE /api/v1/departments/{id} — soft delete. Documents filed under it keep
 * resolving its name; it only leaves the pickers.
 */
export function useDropDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dropDepartment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: departmentQueryKeys.all,
      });
    },
  });
}
