"use client";

import { useEffect, useMemo, useState } from "react";
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

  const showCalendarLoading =
    !isClientReady ||
    (hasToken && calendarQuery.isLoading && calendarQuery.data == null);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <RegulatoryComplianceCalendarHeaderCard />

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
