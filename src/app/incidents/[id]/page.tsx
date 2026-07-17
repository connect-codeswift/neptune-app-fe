"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  IncidentDetailHeader,
  IncidentDetailSummaryCard,
  IncidentDetailInfoCard,
  IncidentDetailResponseCard,
  IncidentDetailRoutingCard,
  IncidentDetailLinkedCard,
  IncidentDetailAiCard,
  IncidentDetailTimelineCard,
  IncidentDetailResponseMetricsCard,
  IncidentDetailAddTimelineCard,
  IncidentDetailPeopleCard,
  IncidentDetailWitnessesCard,
  IncidentDetailNotificationsCard,
  type TabId,
} from "@/components/incidents/detail";

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId =
    typeof params.id === "string" ? params.id : "INC-2025-DET-001";

  const [activeTab, setActiveTab] = useState<TabId>("details");

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        {/* Header containing search bar, quick controls, breadcrumbs, titles and navigation tabs */}
        <IncidentDetailHeader
          incidentId={incidentId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab-based View Content Layout */}
        {activeTab === "details" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_340px]">
            {/* Left Content Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailSummaryCard />
              <IncidentDetailInfoCard />
              <IncidentDetailResponseCard />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailRoutingCard />
              <IncidentDetailLinkedCard />
              <IncidentDetailAiCard />
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_340px]">
            {/* Left Column (Timeline list) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailTimelineCard />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailResponseMetricsCard />
              <IncidentDetailAddTimelineCard />
            </div>
          </div>
        )}

        {activeTab === "people" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_340px]">
            {/* Left Column (People details & Responders) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailPeopleCard />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailWitnessesCard />
              <IncidentDetailNotificationsCard />
            </div>
          </div>
        )}

        {activeTab !== "details" && activeTab !== "timeline" && activeTab !== "people" && (
          <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-[12px] border border-[rgba(15,23,42,0.06)] bg-white/42 p-6">
            <span className="text-ehs-muted-text text-[13px]">
              Content for this tab is coming soon.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
