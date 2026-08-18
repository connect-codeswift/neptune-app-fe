"use client";

import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomNewTrainingSessionForm } from "@/components/hazcom/training/HazcomNewTrainingSessionForm";

/** Log Training Session — POST /api/hazcom/training. */
export function HazcomNewTrainingSessionPageClient() {
  return (
    <HazcomFormLayout>
      <HazcomPageHeader
        breadcrumb={[
          "Safety",
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "Training Log", href: "/dashboard/hazcom/training" },
          "New",
        ]}
        title="Log Training Session"
        subtitle="Record the trainer, attendees, and chemicals covered for a completed session"
      />

      <HazcomNewTrainingSessionForm />
    </HazcomFormLayout>
  );
}
