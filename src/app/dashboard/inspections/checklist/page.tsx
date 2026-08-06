"use client";

import { Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { InspectionChecklistContent } from "@/components/inspections/checklist/InspectionChecklistContent";
import { useRouter, useSearchParams } from "next/navigation";

const START_INSPECTION_ROUTE = "/dashboard/inspections/start";

/** Reads the id from `?inspectionid=`, so it needs a Suspense boundary. */
function InspectionChecklist() {
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get("inspectionid") ?? "";

  return (
    <InspectionChecklistContent
      inspectionId={decodeURIComponent(inspectionId)}
    />
  );
}

export default function InspectionChecklistPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        actionLabel="Start Inspection"
        onActionClick={() => router.push(START_INSPECTION_ROUTE)}
      />

      <Suspense fallback={null}>
        <InspectionChecklist />
      </Suspense>
    </div>
  );
}
