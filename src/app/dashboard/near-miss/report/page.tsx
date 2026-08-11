import { DashboardHeader } from "@/components/DashboardHeader";
import { ReportNearMissForm } from "@/components/near-miss/report/ReportNearMissForm";
import { ReportNearMissHeader } from "@/components/near-miss/report/ReportNearMissHeader";

export default function ReportNearMissPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader />
      {/* max-w-4xl so `mx-auto` actually centres something: without it the
          header stretched the full content width while the form sat centred
          and narrower, which is why the two cards didn't line up. One measure
          for both, and a reading width suited to a five-field form. */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-8">
        <ReportNearMissHeader />
        <ReportNearMissForm />
      </div>
    </div>
  );
}
