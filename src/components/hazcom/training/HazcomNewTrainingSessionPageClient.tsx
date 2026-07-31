"use client";

import { HazcomModuleTabs, HazcomPageHeader } from "@/components/hazcom/shared";
import { HazcomNewTrainingSessionForm } from "@/components/hazcom/training/HazcomNewTrainingSessionForm";

export function HazcomNewTrainingSessionPageClient() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Training Log"]}
        title="HazCom Training Log"
        subtitle="Record training sessions, attendees, chemicals covered, and digital sign-offs"
      />

      <HazcomNewTrainingSessionForm />
    </div>
  );
}
