"use client";

import { useState } from "react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { toast } from "@/lib/toast";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { getComplianceObligationById } from "../regulatory-compliance-data";
import { RegulatoryComplianceDetailBannerCard } from "./RegulatoryComplianceDetailBannerCard";
import { RegulatoryComplianceObligationDetailsCard } from "./RegulatoryComplianceObligationDetailsCard";

export type RegulatoryComplianceDetailViewProps = Readonly<{
  id: string;
}>;

export function RegulatoryComplianceDetailView(
  props: RegulatoryComplianceDetailViewProps,
) {
  const { id } = props;

  const [detail, setDetail] = useState(() => getComplianceObligationById(id));
  const [searchQuery, setSearchQuery] = useState("");

  const handleMarkAsComplete = () => {
    if (detail.status === "Compliant") {
      toast.info(
        "Already Completed",
        `Obligation ${detail.code} has already been marked as complete.`,
      );
      return;
    }

    const nowFormatted = formatShortDateTime(new Date());

    setDetail((prev) => ({
      ...prev,
      status: "Compliant",
      completedDate: nowFormatted,
    }));

    toast.success(
      "Marked as Complete",
      `Obligation ${detail.code} (${detail.title}) has been verified and marked complete.`,
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
        actionLabel="Back to Register"
        actionLabelShort="Back"
        className="px-0 py-0"
      />

      {/* Top Banner Card */}
      <RegulatoryComplianceDetailBannerCard
        detail={detail}
        onMarkAsComplete={handleMarkAsComplete}
      />

      {/* Main Details Card */}
      <RegulatoryComplianceObligationDetailsCard detail={detail} />
    </div>
  );
}
