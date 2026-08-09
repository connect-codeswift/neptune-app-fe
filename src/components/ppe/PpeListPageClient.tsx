"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeInventorySection } from "@/components/ppe/PpeInventorySection";
import { PpeManagementActions } from "@/components/ppe/PpeManagementActions";
import { PpeViewTabs } from "@/components/ppe/PpeViewTabs";

export function PpeListPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="PPE Management" />
      <div className="flex flex-1 flex-col gap-4.5 px-3 pb-8 sm:px-4">
        {/* Tabs and actions share one band. As separate rows each was half
            empty — tabs with a vacant right side, actions with a vacant left —
            which stacked ~120px of dead space above the fold. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PpeViewTabs />
          <PpeManagementActions />
        </div>
        <PpeInventorySection />
      </div>
    </div>
  );
}
