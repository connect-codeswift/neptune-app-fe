"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReportIncidentFormState } from "@/components/incidents/report/shared/report-incident-state";
import { getAuthContext } from "@/lib/auth-context";
import { closeIncident, createIncident } from "@/services/incident.service";
import { mapReportFormToIncidentDto } from "@/services/mappers/report-incident.mapper";
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

/** Sets incident status to Closed; keeps the record for list/filter. */
export function useCloseIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: number) => {
      const auth = getAuthContext();
      if (!auth) {
        throw new Error("Sign in required to close an incident.");
      }

      return closeIncident(incidentId, {
        userId: auth.userId,
        subCompanyId: auth.subCompanyId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.all });
    },
  });
}
