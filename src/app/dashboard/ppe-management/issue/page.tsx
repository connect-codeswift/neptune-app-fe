import { DashboardHeader } from "@/components/DashboardHeader";
import { IssuePpeContent } from "@/components/ppe/issue/IssuePpeContent";

export default function IssuePpePage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <IssuePpeContent />
    </div>
  );
}
