"use client";

import { useState } from "react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { toast } from "@/lib/toast";
import { INITIAL_CALENDAR_EVENTS } from "../regulatory-compliance-data";
import { RegulatoryComplianceCalendarHeaderCard } from "./RegulatoryComplianceCalendarHeaderCard";
import { RegulatoryComplianceCalendarGrid } from "./RegulatoryComplianceCalendarGrid";

export function RegulatoryComplianceCalendarView() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddObligation = () => {
    toast.info(
      "Add Obligation",
      "Opening compliance obligation modal...",
    );
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 bg-[#f8fafc]">
      {/* Top Header from Incident Module */}
      <IncidentListHeader
        title=""
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        reportHref="/dashboard/regulatory-compliance"
        actionLabel="Report incident"
        actionLabelShort="Report"
        className="px-0 py-0"
      />

      {/* Banner Card Header */}
      <RegulatoryComplianceCalendarHeaderCard
        monthLabel="March 2025"
        onAddObligation={handleAddObligation}
      />

      {/* Main Month Calendar Grid */}
      <RegulatoryComplianceCalendarGrid events={INITIAL_CALENDAR_EVENTS} />
    </div>
  );
}
