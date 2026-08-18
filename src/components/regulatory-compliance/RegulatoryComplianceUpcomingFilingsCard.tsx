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
      paddingClassName="p-[18px]"
      className={[complianceGlassCardClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col">
        <div>
          <Text as="h3" className="text3 text-ehs-darker">
            Upcoming filings
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mt-0.5">
            Next 90 days
          </Text>
        </div>

        {isLoading ? (
          <div className="mt-4.5 flex flex-col">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`filing-skeleton-${String(index)}`}
                className="flex h-[37px] items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="rounded-1.5 h-3.5 w-10 animate-pulse bg-[#e2e8f0]" />
                  <div className="rounded-1.5 h-4.25 min-w-0 flex-1 animate-pulse bg-[#e2e8f0]" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-[#e2e8f0]" />
              </div>
            ))}
          </div>
        ) : filings.length === 0 ? (
          <Text as="p" className="text8 text-ehs-muted-text mt-4.5 pt-4.5">
            No upcoming filings in the next 90 days.
          </Text>
        ) : (
          <div className="mt-4.5 flex flex-col">
            {filings.map((item) => (
              <div
                key={item.id}
                className="flex h-[37px] items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Text
                    as="span"
                    className="text8 text-ehs-muted-text w-17 shrink-0"
                  >
                    {item.date}
                  </Text>
                  <Text as="span" className="text4 text-ehs-darker truncate">
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
