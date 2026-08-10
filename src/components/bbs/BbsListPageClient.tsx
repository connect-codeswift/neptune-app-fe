"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { BbsRecentSessionsSection } from "@/components/bbs/BbsRecentSessionsSection";
import { BbsViewTabs } from "@/components/bbs/BbsViewTabs";

export function BbsListPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Proactive Safety" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <BbsViewTabs />
        <BbsRecentSessionsSection />
      </div>
    </div>
  );
}
