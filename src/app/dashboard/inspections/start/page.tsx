import { Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StartInspectionForm } from "@/components/inspections/start/StartInspectionForm";
import { StartInspectionHeader } from "@/components/inspections/start/StartInspectionHeader";

export default function StartInspectionPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pb-8">
        <StartInspectionHeader />
        {/* StartInspectionForm reads useSearchParams, which needs a boundary. */}
        <Suspense fallback={null}>
          <StartInspectionForm />
        </Suspense>
      </div>
    </div>
  );
}
