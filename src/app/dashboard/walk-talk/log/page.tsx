import { DashboardHeader } from "@/components/DashboardHeader";
import { LogWalkTalkContent } from "@/components/walk-talk/log/LogWalkTalkContent";

export default function LogWalkTalkPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <LogWalkTalkContent />
    </div>
  );
}
