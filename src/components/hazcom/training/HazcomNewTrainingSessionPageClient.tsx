"use client";

import { HazcomFormLayout, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomNewTrainingSessionForm } from "@/components/hazcom/training/HazcomNewTrainingSessionForm";

export function HazcomNewTrainingSessionPageClient() {
  return (
    <HazcomFormLayout>
      {/* Was the list page's own header — same breadcrumb, same
          "HazCom Training Log" title — so this create form announced itself as
          the log the user had just navigated away from. Named for what the page
          does instead, matching the button that leads here. */}
      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Training Log", "New"]}
        title="Log Training Session"
        subtitle="Record the trainer, attendees, and chemicals covered for a completed session"
      />

      <HazcomNewTrainingSessionForm />
    </HazcomFormLayout>
  );
}
