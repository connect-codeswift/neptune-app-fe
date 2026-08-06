"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useComplianceCalendarQuery } from "@/hooks/use-compliance-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { getComplianceCalendarMonthRange } from "@/services/mappers/compliance.mapper";
import { toast } from "@/lib/toast";
import { RegulatoryComplianceCalendarHeaderCard } from "./RegulatoryComplianceCalendarHeaderCard";
import { RegulatoryComplianceCalendarGrid } from "./RegulatoryComplianceCalendarGrid";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function RegulatoryComplianceCalendarView() {
  const router = useRouter();
  const [activeStartDate, setActiveStartDate] = useState(() =>
    startOfMonth(new Date()),
  );

  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const queryEnabled = isClientReady && hasToken;

  const { startDate, endDate } = useMemo(
    () => getComplianceCalendarMonthRange(activeStartDate),
    [activeStartDate],
  );

  const calendarQuery = useComplianceCalendarQuery({
    startDate,
    endDate,
    enabled: queryEnabled,
  });

  useEffect(() => {
    if (calendarQuery.isError) {
      toast.error(
        "Could not load calendar",
        getMutationErrorMessage(
          calendarQuery.error,
          "Failed to load compliance calendar events.",
        ),
      );
    }
  }, [calendarQuery.isError, calendarQuery.error]);

  const handleAddObligation = () => {
    router.push("/dashboard/regulatory-compliance/calendar/new");
  };

  const monthLabel = activeStartDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const showCalendarLoading =
    !isClientReady ||
    (hasToken && calendarQuery.isLoading && calendarQuery.data == null);

  return (
    <div className="bg-ehs-light-bg flex flex-1 flex-col gap-4 px-4">
      <IncidentListHeader
        title=""
        reportHref="/dashboard/incidents/report-incident"
        actionLabel="Report incident"
        className="px-0 py-0"
      />

      <RegulatoryComplianceCalendarHeaderCard
        monthLabel={monthLabel}
        onAddObligation={handleAddObligation}
      />

      <RegulatoryComplianceCalendarGrid
        events={calendarQuery.data ?? []}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={(date) =>
          setActiveStartDate(startOfMonth(date))
        }
        isLoading={showCalendarLoading}
      />
    </div>
  );
}
