import { ReportNearMissForm } from "@/components/near-miss/report/ReportNearMissForm";
import { ReportNearMissHeader } from "@/components/near-miss/report/ReportNearMissHeader";

export default function ReportNearMissPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <ReportNearMissHeader />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <ReportNearMissForm />
      </div>
    </div>
  );
}
