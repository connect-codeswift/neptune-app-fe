"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { WalkTalkRecentSessionsSection } from "@/components/walk-talk/WalkTalkRecentSessionsSection";
import { WalkTalkViewTabs } from "@/components/walk-talk/WalkTalkViewTabs";

export function WalkTalkListPageClient() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader title="Walk & Talk" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        <WalkTalkViewTabs />
        <WalkTalkRecentSessionsSection />
      </div>
    </div>
  );
}
