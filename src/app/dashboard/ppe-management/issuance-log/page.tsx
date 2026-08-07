import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeIssuanceLogContent } from "@/components/ppe/log/PpeIssuanceLogContent";

export default function PpeIssuanceLogPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <PpeIssuanceLogContent />
    </div>
  );
}
