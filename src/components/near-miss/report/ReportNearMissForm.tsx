"use client";

import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { toast } from "@/lib/toast";
import {
  nearMissReportSchema,
  type NearMissReportValues,
} from "./near-miss-report-schema";

const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";

export function ReportNearMissForm() {
  const router = useRouter();

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching NearMissReportValues.
    const report = values as NearMissReportValues;
    // TODO: replace with the create-near-miss API call once available.
    console.info("Near-miss report submitted", report);
    toast.success("Near-miss report submitted");
    router.push(NEAR_MISS_LIST_ROUTE);
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="mx-auto w-full max-w-4xl bg-white!"
    >
      <FormBuilder
        schema={nearMissReportSchema}
        submitLabel="Submit Near-Miss Report"
        cancelLabel="Cancel"
        onSubmit={handleSubmit}
        onCancel={() => router.push(NEAR_MISS_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
