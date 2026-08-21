"use client";

import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomNewTrainingSessionForm } from "@/components/hazcom/training/HazcomNewTrainingSessionForm";

/** Schedule Training — POST /api/v1/hazcom/trainings. */
export function HazcomNewTrainingSessionPageClient() {
  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={[
          "Safety",
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "Schedule Training", href: "/dashboard/hazcom/training" },
          "New",
        ]}
        title="Schedule Training"
        subtitle="Assign a trainer and attendees, and pick the chemicals a session will cover"
      />

      <HazcomNewTrainingSessionForm />
    </HazcomFormLayout>
  );
}
