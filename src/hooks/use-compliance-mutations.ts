"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  AddComplianceRequestDto,
  UpdateComplianceRequestDto,
} from "@/dtos/req/compliance-request.dto";
import type { ComplianceDto } from "@/dtos/res/compliance-response.dto";
import {
  complianceQueryKeys,
  type ComplianceByIdQueryResult,
} from "@/hooks/use-compliance-queries";
import {
  mapComplianceDtoToObligationDetail,
  normalizeComplianceByIdResponse,
  patchComplianceListQueryData,
  type CompliancesListQueryData,
} from "@/services/mappers/compliance.mapper";
import {
  addCompliance,
  deleteCompliance,
  markComplianceComplete,
  updateCompliance,
} from "@/services/compliance.service";

function patchComplianceDetailCache(
  queryClient: QueryClient,
  id: number,
  variables: UpdateComplianceRequestDto,
  response: unknown,
) {
  queryClient.setQueryData<ComplianceByIdQueryResult | null>(
    complianceQueryKeys.detail(id),
    (current) => {
      if (!current) {
        return current;
      }

      const fromResponse = normalizeComplianceByIdResponse(response);
      const dto: ComplianceDto = {
        ...current.dto,
        ...fromResponse,
        id,
        code: variables.code,
        title: variables.title,
        category: variables.category,
        jurisdiction: variables.jurisdiction,
        regulatoryBody: variables.regulatoryBody,
        dueDate: variables.dueDate,
        nextDue: variables.nextDue,
        recurrence: variables.recurrence,
        responsiblePersonId: variables.responsiblePersonId,
        responsiblePerson: variables.responsiblePerson,
        priority: variables.priority,
        status: variables.status,
        completedDate: variables.completedDate,
        evidenceUrls: variables.evidenceUrls,
        markComplete: variables.markComplete,
      };

      return {
        dto,
        detail: mapComplianceDtoToObligationDetail(dto, {
          responsibleName:
            dto.responsiblePerson?.trim() ||
            (current.detail.responsible !== "—"
              ? current.detail.responsible
              : undefined),
        }),
      };
    },
  );
}

function patchComplianceListCaches(
  queryClient: QueryClient,
  variables: UpdateComplianceRequestDto,
) {
  queryClient.setQueriesData<CompliancesListQueryData>(
    {
      predicate: (query) =>
        query.queryKey[0] === complianceQueryKeys.all[0] &&
        query.queryKey[1] === "list",
    },
    (current) => patchComplianceListQueryData(current, variables),
  );
}

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

/** PUT /api/Compliance/Update */
export function useUpdateComplianceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateComplianceRequestDto) =>
      updateCompliance(payload),
    onSuccess: async (response, variables) => {
      patchComplianceDetailCache(
        queryClient,
        variables.id,
        variables,
        response,
      );
      patchComplianceListCaches(queryClient, variables);
      await invalidateComplianceSummaries(queryClient);
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
