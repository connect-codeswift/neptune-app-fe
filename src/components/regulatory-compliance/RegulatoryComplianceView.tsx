"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { RegulatoryComplianceKpiGrid } from "./RegulatoryComplianceKpiGrid";
import { RegulatoryComplianceRegisterCard } from "./RegulatoryComplianceRegisterCard";
import { RegulatoryComplianceByCategoryCard } from "./RegulatoryComplianceByCategoryCard";
import { RegulatoryComplianceUpcomingFilingsCard } from "./RegulatoryComplianceUpcomingFilingsCard";
import {
  INITIAL_CATEGORIES,
  INITIAL_KPI_ITEMS,
  INITIAL_OBLIGATIONS,
  INITIAL_UPCOMING_FILINGS,
} from "./regulatory-compliance-data";

export function RegulatoryComplianceView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7 bg-[#f8fafc]">
      {/* Top Header from Incident Module */}
      <IncidentListHeader
        title="Regularity Compliance"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications={true}
        actionLabel="Add Obligation"
        reportHref="#"
        className="px-0 py-0"
      />

      {/* KPI Cards Row */}
      <RegulatoryComplianceKpiGrid items={INITIAL_KPI_ITEMS} />

      {/* View Mode Bar: Calendar View Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/regulatory-compliance/calendar"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-4 py-2 text-[13px] font-bold text-[#0f172a] shadow-xs transition-all hover:bg-[#f8fafc]"
        >
          <Icon icon="mdi:calendar-month-outline" className="text-base text-[#0891a6]" />
          <span>Calendar View</span>
        </Link>
      </div>

      {/* Main Content Grid: Register Table Card (Left) + Right Sidebar Stack */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
        {/* Left: Main Register Table Card */}
        <RegulatoryComplianceRegisterCard
          items={INITIAL_OBLIGATIONS}
          searchQuery={searchQuery}
        />

        {/* Right Sidebar Stack: By Category + Upcoming Filings */}
        <div className="flex flex-col gap-6">
          <RegulatoryComplianceByCategoryCard categories={INITIAL_CATEGORIES} />
          <RegulatoryComplianceUpcomingFilingsCard
            filings={INITIAL_UPCOMING_FILINGS}
          />
        </div>
      </div>
    </div>
  );
}
