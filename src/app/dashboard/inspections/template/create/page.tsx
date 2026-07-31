import { DashboardHeader } from "@/components/DashboardHeader";
import { CreateTemplateContent } from "@/components/inspections/templates/create/CreateTemplateContent";

export default function CreateInspectionTemplatePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <CreateTemplateContent />
    </div>
  );
}
