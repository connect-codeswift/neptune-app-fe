"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { INITIAL_CALENDAR_EVENTS } from "../regulatory-compliance-data";
import { RegulatoryComplianceCalendarHeaderCard } from "./RegulatoryComplianceCalendarHeaderCard";
import { RegulatoryComplianceCalendarGrid } from "./RegulatoryComplianceCalendarGrid";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function RegulatoryComplianceCalendarView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStartDate, setActiveStartDate] = useState(() =>
    startOfMonth(new Date()),
  );

  const handleAddObligation = () => {
    router.push("/dashboard/regulatory-compliance/calendar/new");
  };

  const monthLabel = activeStartDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col gap-4 px-4">
      {/* Top Header from Incident Module */}
      <IncidentListHeader
        title=""
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        reportHref="/dashboard/incidents/report-incident"
        actionLabel="Report incident"
        searchPosition="start"
        className="px-0 py-0"
      />

      {/* Banner Card Header */}
      <RegulatoryComplianceCalendarHeaderCard
        monthLabel={monthLabel}
        onAddObligation={handleAddObligation}
      />

      {/* Main Month Calendar Grid */}
      <RegulatoryComplianceCalendarGrid
        events={INITIAL_CALENDAR_EVENTS}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={(date) =>
          setActiveStartDate(startOfMonth(date))
        }
      />
    </div>
  );
}
