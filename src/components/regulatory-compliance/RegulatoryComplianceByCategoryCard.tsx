"use client";

import { IncidentGlassCard } from "@/components/incidents";
import { Text } from "@/components/Text";
import type { ComplianceCategoryProgress } from "./regulatory-compliance-types";

export type RegulatoryComplianceByCategoryCardProps = Readonly<{
  categories: readonly ComplianceCategoryProgress[];
  isLoading?: boolean;
  className?: string;
}>;

export function RegulatoryComplianceByCategoryCard(
  props: RegulatoryComplianceByCategoryCardProps,
) {
  const { categories, isLoading = false, className = "" } = props;

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
            By Category
          </Text>
          <Text
            as="p"
            className="text-ehs-muted-text mt-0.5 text-[12px] font-light"
          >
            Compliance posture
          </Text>
        </div>

        {isLoading ? (
          <div className="mt-1 flex flex-col gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`category-skeleton-${String(index)}`} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-[80px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                  <div className="h-3 w-[36px] animate-pulse rounded-[6px] bg-[#e2e8f0]" />
                </div>
                <div className="h-2 w-full animate-pulse rounded-full bg-[#e2e8f0]" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-[13px]">
            No category stats available yet.
          </Text>
        ) : (
          <div className="mt-1 flex flex-col gap-4">
            {categories.map((cat) => {
              const percent =
                cat.total > 0
                  ? Math.min(
                      100,
                      Math.max(0, Math.round((cat.current / cat.total) * 100)),
                    )
                  : 0;

              return (
                <div key={cat.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <Text as="span" className="text-ehs-dark-bg font-semibold">
                      {cat.category}
                    </Text>
                    <Text
                      as="span"
                      className="text-ehs-gray text-[12px] font-semibold"
                    >
                      {`${cat.current}/${cat.total}`}
                    </Text>
                  </div>

                  <div className="bg-ehs-border h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.colorHex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </IncidentGlassCard>
  );
}
