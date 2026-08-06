import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeAcknowledgementsContent } from "@/components/ppe/acknowledgements/PpeAcknowledgementsContent";

export default function PpeAcknowledgementsPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <PpeAcknowledgementsContent />
    </div>
  );
}
