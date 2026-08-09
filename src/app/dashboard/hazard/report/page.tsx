import { DashboardHeader } from "@/components/DashboardHeader";
import { ReportHazardForm } from "@/components/hazard/report/ReportHazardForm";
import { ReportHazardHeader } from "@/components/hazard/report/ReportHazardHeader";

export default function ReportHazardPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader />
      {/* `mx-auto` centred nothing without a max-width: the header spanned the
          full content width while the form card sat at max-w-3xl and stranded
          itself on the left. One measure for both. */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-8">
        <ReportHazardHeader />
        <ReportHazardForm />
      </div>
    </div>
  );
}
