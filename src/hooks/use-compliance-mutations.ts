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

/** POST /api/Compliance/AddCompliance */
export function useAddComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddComplianceRequestDto) => addCompliance(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: complianceQueryKeys.all });
    },
  });
}

/** PUT /api/Compliance/Update — mark obligation complete. */
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

/** DELETE /api/Compliance/{id} */
export function useDeleteComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCompliance(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: complianceQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: complianceQueryKeys.all });
    },
  });
}
