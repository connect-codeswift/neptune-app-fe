"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { toast } from "@/lib/toast";
import { PhotoEvidenceField } from "./PhotoEvidenceField";
import {
  hazardReportSchema,
  type HazardReportValues,
} from "./hazard-report-schema";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export function ReportHazardForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching HazardReportValues.
    const report = values as HazardReportValues;
    setIsSubmitting(true);

    // TODO: wire to a hazard-create mutation once the service exists.
    void report;
    void photos;

    toast.success("Hazard report submitted");
    router.push(HAZARD_LIST_ROUTE);
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="h-155 w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        schema={hazardReportSchema}
        submitLabel={isSubmitting ? "Submitting..." : "Submit Hazard Report"}
        cancelLabel="Cancel"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push(HAZARD_LIST_ROUTE)}
        beforeActions={<PhotoEvidenceField onChange={setPhotos} />}
      />
    </IncidentGlassCard>
  );
}
