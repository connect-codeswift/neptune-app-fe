import { DashboardHeader } from "@/components/DashboardHeader";
import { ReportNearMissForm } from "@/components/near-miss/report/ReportNearMissForm";
import { ReportNearMissHeader } from "@/components/near-miss/report/ReportNearMissHeader";

export default function ReportNearMissPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader />
      <div className="mx-auto flex w-full flex-col gap-5 px-4">
        <ReportNearMissHeader />
        <ReportNearMissForm />
      </div>
    </div>
  );
}
