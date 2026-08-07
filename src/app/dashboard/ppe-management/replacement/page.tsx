import { Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ReplacementRequestContent } from "@/components/ppe/replacement/ReplacementRequestContent";

export default function ReplacementRequestPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <Suspense fallback={null}>
        <ReplacementRequestContent />
      </Suspense>
    </div>
  );
}
