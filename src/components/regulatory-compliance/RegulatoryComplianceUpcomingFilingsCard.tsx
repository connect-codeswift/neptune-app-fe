"use client";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type { UpcomingFilingItem } from "./regulatory-compliance-types";
import { CompliancePill, complianceGlassCardClass } from "./compliance-ui";

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
      paddingClassName="p-[17.51px]"
      className={[complianceGlassCardClass, className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col">
        <div>
          <Text
            as="h3"
            className="text-[14px] leading-none font-bold tracking-[-0.14px] text-[#0b1320]"
          >
            Upcoming filings
          </Text>
          <Text
            as="p"
            className="mt-[2px] text-[10px] leading-normal font-normal text-[#8892a3]"
          >
            Next 90 days
          </Text>
        </div>

        {isLoading ? (
          <div className="mt-[18px] flex flex-col">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`filing-skeleton-${String(index)}`}
                className="flex h-[36.785px] items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                  <div className="h-[14px] w-10 animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                  <div className="h-[17px] min-w-0 flex-1 animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-[#e2e8f0]" />
              </div>
            ))}
          </div>
        ) : filings.length === 0 ? (
          <Text
            as="p"
            className="mt-[18px] pt-[18px] text-[12px] text-[#8892a3]"
          >
            No upcoming filings in the next 90 days.
          </Text>
        ) : (
          <div className="mt-[18px] flex flex-col">
            {filings.map((item) => (
              <div
                key={item.id}
                className="flex h-[36.785px] items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-[10px]">
                  <Text
                    as="span"
                    className="w-[68px] shrink-0 text-[10px] leading-normal font-normal text-[#8892a3]"
                  >
                    {item.date}
                  </Text>
                  <Text
                    as="span"
                    className="truncate text-[12px] leading-normal font-normal text-[#0b1320]"
                  >
                    {item.title}
                  </Text>
                </div>

                <CompliancePill label={item.badgeLabel} className="shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </IncidentGlassCard>
  );
}
