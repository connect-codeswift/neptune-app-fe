"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { AddComplianceRequestDto } from "@/dtos/req/compliance-request.dto";
import { complianceQueryKeys } from "@/hooks/use-compliance-queries";
import {
  addCompliance,
  deleteCompliance,
  markComplianceComplete,
} from "@/services/compliance.service";

/** Refreshes dashboard/register data without refetching the open detail query. */
async function invalidateComplianceSummaries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: complianceQueryKeys.dashboardKpis,
      refetchType: "all",
    }),
    queryClient.invalidateQueries({
      queryKey: complianceQueryKeys.categoryStats,
      refetchType: "all",
    }),
    queryClient.invalidateQueries({
      queryKey: complianceQueryKeys.upcomingFilings,
      refetchType: "all",
    }),
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === complianceQueryKeys.all[0] &&
        (query.queryKey[1] === "list" || query.queryKey[1] === "calendar"),
      refetchType: "all",
    }),
  ]);
}

/** POST /api/v1/compliance-records */
export function useAddComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddComplianceRequestDto) => addCompliance(payload),
    onSuccess: async () => {
      // Must not reject: TanStack Query awaits onSuccess and rejects
      // `mutateAsync` if it throws, so a failed refetch here reported an
      // already-saved record as a failed submit and invited a retry that
      // created a duplicate. The write is done; a stale cache is not worth
      // that.
      try {
        await queryClient.invalidateQueries({
          queryKey: complianceQueryKeys.all,
        });
      } catch {
        // Intentionally ignored — see above.
      }
    },
  });
}

/** PUT /api/v1/compliance-records/{id} — mark obligation complete. */
export function useMarkCompleteComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markComplianceComplete(id),
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: complianceQueryKeys.detail(id),
          refetchType: "all",
        }),
        invalidateComplianceSummaries(queryClient),
      ]);
    },
  });
}

/** DELETE /api/v1/compliance-records/{id} */
export function useDeleteComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCompliance(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: complianceQueryKeys.detail(id) });
      await queryClient.invalidateQueries({
        queryKey: complianceQueryKeys.all,
      });
    },
  });
}
