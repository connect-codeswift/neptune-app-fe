import { DashboardHeader } from "@/components/DashboardHeader";
import { ReportHazardForm } from "@/components/hazard/report/ReportHazardForm";
import { ReportHazardHeader } from "@/components/hazard/report/ReportHazardHeader";

export default function ReportHazardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader title="Add Report Hazard" />
      <div className="mx-auto flex w-full flex-col gap-5 px-4">
        <ReportHazardHeader />
        <ReportHazardForm />
      </div>
    </div>
  );
}
