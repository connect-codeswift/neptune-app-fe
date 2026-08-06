"use client";

import { Suspense } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StartAuditForm } from "@/components/audits/start/StartAuditForm";
import { StartAuditHeader } from "@/components/audits/start/StartAuditHeader";

export default function StartAuditPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <StartAuditHeader />
        {/* StartAuditForm reads useSearchParams, which needs a Suspense boundary. */}
        <Suspense fallback={null}>
          <StartAuditForm />
        </Suspense>
      </div>
    </div>
  );
}
