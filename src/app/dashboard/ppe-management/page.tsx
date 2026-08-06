"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { PpeInventorySection, PpeMetricsSection } from "@/components/ppe";

export default function PpeManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="PPE Management"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex flex-1 flex-col gap-4.5 px-3 pb-8 sm:px-4">
        <PpeMetricsSection />
        <PpeInventorySection />
      </div>
    </div>
  );
}
