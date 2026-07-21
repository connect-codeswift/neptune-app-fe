"use client";

import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  nearMissReportSchema,
  type NearMissReportValues,
} from "./near-miss-report-schema";

const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";

function toCreateRequest(
  report: NearMissReportValues,
): CreateNearMissRequestDto {
  // userId / subCompanyId come from the signed-in user's access-token claims.
  const { userId, subCompanyId } = getCurrentUser();

  return {
    dateOfEvent: report.dateOfEvent,
    hazardType: report.hazardType,
    location: report.location,
    whatHappened: report.whatHappened,
    contributingFactor: report.contributingFactors,
    isDrop: false,
    userId,
    subCompanyId,
  };
}

export function ReportNearMissForm() {
  const router = useRouter();
  const createNearMiss = useCreateNearMissMutation();

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching NearMissReportValues.
    const payload = toCreateRequest(values as NearMissReportValues);

    createNearMiss.mutate(payload, {
      onSuccess: () => {
        toast.success("Near-miss report submitted");
        router.push(NEAR_MISS_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not submit the near-miss report. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="mx-auto w-full max-w-4xl bg-white!"
    >
      <FormBuilder
        schema={nearMissReportSchema}
        submitLabel={
          createNearMiss.isPending ? "Submitting..." : "Submit Near-Miss Report"
        }
        cancelLabel="Cancel"
        isSubmitting={createNearMiss.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(NEAR_MISS_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
