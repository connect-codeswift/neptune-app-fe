import { DashboardHeader } from "@/components/DashboardHeader";
import { LogObservationContent } from "@/components/bbs/log/LogObservationContent";

export default function LogBbsObservationPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <LogObservationContent />
    </div>
  );
}
