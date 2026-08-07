"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeMetricsSection } from "@/components/ppe/PpeMetricsSection";
import { PpeViewTabs } from "@/components/ppe/PpeViewTabs";

export function PpeDashboardPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="PPE Management" />
      <div className="flex flex-1 flex-col gap-4.5 px-3 pb-8 sm:px-4">
        <PpeViewTabs />
        <PpeMetricsSection />
      </div>
    </div>
  );
}
