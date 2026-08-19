"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReportIncidentFormState } from "@/components/incidents/report/shared/report-incident-state";
import { getAuthContext } from "@/lib/auth-context";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";
import {
  createIncident,
  submitIncidentClosure,
  updateIncident,
  updateIncidentClosure,
} from "@/services/incident.service";
import { mapReportFormToIncidentDto } from "@/services/mappers/report-incident.mapper";
import { mapIncidentClosureDataToUpdateDto } from "@/services/mappers/incident-closure.mapper";
import { incidentQueryKeys } from "@/hooks/use-incident-queries";

export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: ReportIncidentFormState) => {
      const auth = getAuthContext();
      const payload = mapReportFormToIncidentDto(form, auth);
      return createIncident(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.all });
    },
  });
}

/** Submits closure and marks the incident closed via POST /closure/submit. */
export function useCloseIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: number) => {
      if (!getAuthContext()) {
        throw new Error("Sign in required to close an incident.");
      }

      return submitIncidentClosure(incidentId);
    },
    onSuccess: async (_result, incidentId) => {
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.closure(incidentId),
      });
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.detail(incidentId),
      });
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.all });
    },
  });
}

/** Updates incident fields via PUT /api/v1/incidents/{id}. */
export function useUpdateIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      incidentId: number;
      patch: Partial<IncidentDto>;
    }) => {
      if (!getAuthContext()) {
        throw new Error("Sign in required to update an incident.");
      }

      return updateIncident(input.incidentId, input.patch);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.all });
    },
  });
}

/** Updates incident closure details via PUT /api/v1/incidents/{incidentId}/closure */
export function useUpdateIncidentClosureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      incidentId: number;
      data: IncidentClosureData;
    }) => {
      const payload = mapIncidentClosureDataToUpdateDto(input.data);
      return updateIncidentClosure(input.incidentId, payload);
    },
    onSuccess: async (_res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.closure(variables.incidentId),
      });
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.all });
    },
  });
}
