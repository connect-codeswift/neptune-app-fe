"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeInventorySection } from "@/components/ppe/PpeInventorySection";
import { PpeViewTabs } from "@/components/ppe/PpeViewTabs";

export function PpeListPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="PPE Management" />
      <div className="flex flex-1 flex-col gap-4.5 px-3 pb-8 sm:px-4">
        <PpeViewTabs />
        <PpeInventorySection />
      </div>
    </div>
  );
}
