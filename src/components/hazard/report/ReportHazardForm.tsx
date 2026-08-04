"use client";

import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import type { CreateHazardRequestDto } from "@/dtos/req/hazard-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateHazardMutation } from "@/hooks/use-hazard-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  hazardReportSchema,
  type HazardReportValues,
} from "./hazard-report-schema";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

function toCreateRequest(report: HazardReportValues): CreateHazardRequestDto {
  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();

  return {
    type: report.hazardType,
    location: report.location,
    description: report.description,
    // The endpoint takes a single URL; the field is capped at one photo.
    image: report.photos[0] ?? "",
    // Assignment happens after triage, so nobody is assigned on create.
    assignedTo: 0,
    userId,
    siteId,
    isDrop: false,
  };
}

export function ReportHazardForm() {
  const router = useRouter();
  const createHazard = useCreateHazardMutation();

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching HazardReportValues.
    const payload = toCreateRequest(values as HazardReportValues);

    createHazard.mutate(payload, {
      onSuccess: () => {
        toast.success("Hazard report submitted");
        router.push(HAZARD_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the hazard report. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="min-h-155 w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        schema={hazardReportSchema}
        submitLabel={
          createHazard.isPending ? "Submitting..." : "Submit Hazard Report"
        }
        cancelLabel="Cancel"
        isSubmitting={createHazard.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(HAZARD_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
