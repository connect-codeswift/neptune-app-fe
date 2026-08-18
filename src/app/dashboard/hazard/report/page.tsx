import { ReportHazardForm } from "@/components/hazard/report/ReportHazardForm";
import { ReportHazardHeader } from "@/components/hazard/report/ReportHazardHeader";

export default function ReportHazardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <ReportHazardHeader />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <ReportHazardForm />
      </div>
    </div>
  );
}
