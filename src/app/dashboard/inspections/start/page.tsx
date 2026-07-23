import { DashboardHeader } from "@/components/DashboardHeader";
import { StartInspectionForm } from "@/components/inspections/start/StartInspectionForm";
import { StartInspectionHeader } from "@/components/inspections/start/StartInspectionHeader";

export default function StartInspectionPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <StartInspectionHeader />
        <StartInspectionForm />
      </div>
    </div>
  );
}
