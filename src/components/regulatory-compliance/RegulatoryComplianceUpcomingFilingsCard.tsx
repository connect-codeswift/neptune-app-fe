"use client";

import { IncidentGlassCard, IncidentBadge } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { UpcomingFilingItem } from "./regulatory-compliance-types";

export type RegulatoryComplianceUpcomingFilingsCardProps = Readonly<{
  filings: readonly UpcomingFilingItem[];
  isLoading?: boolean;
  className?: string;
}>;

export function RegulatoryComplianceUpcomingFilingsCard(
  props: RegulatoryComplianceUpcomingFilingsCardProps,
) {
  const { filings, isLoading = false, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className={["bg-[rgba(255,255,255,0.62)] backdrop-blur-[10px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Text
            as="h3"
            className="text-ehs-dark-bg text-[15px] leading-tight font-bold"
          >
            Upcoming filings
          </Text>
          <Text
            as="p"
            className="text-ehs-muted-text mt-0.5 text-[12px] font-light"
          >
            Next 90 days
          </Text>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`filing-skeleton-${String(index)}`}
                className="flex items-center justify-between gap-3 py-1"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-3 w-10 animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                  <div className="h-3 min-w-0 flex-1 animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-[#e2e8f0]" />
              </div>
            ))}
          </div>
        ) : filings.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-[13px]">
            No upcoming filings in the next 90 days.
          </Text>
        ) : (
          <div className="divide-ehs-border/60 flex flex-col divide-y text-[13px]">
            {filings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Text
                    as="span"
                    className="text-ehs-muted-text shrink-0 text-[12px] font-light"
                  >
                    {item.date}
                  </Text>
                  <div className="flex min-w-0 flex-col">
                    <Text
                      as="span"
                      className="text-ehs-dark-bg truncate font-light"
                    >
                      {item.title}
                    </Text>
                    {item.responsiblePerson ? (
                      <Text
                        as="span"
                        className="text-ehs-muted-text truncate text-[11px] font-light"
                      >
                        {item.responsiblePerson}
                      </Text>
                    ) : null}
                  </div>
                </div>

                <IncidentBadge
                  label={item.badgeLabel}
                  tone={item.badgeTone === "action" ? "danger" : "muted"}
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </IncidentGlassCard>
  );
}
