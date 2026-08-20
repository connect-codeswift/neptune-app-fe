"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type { ComplianceCategoryProgress } from "./regulatory-compliance-types";
import { complianceGlassCardClass } from "./compliance-ui";

export type RegulatoryComplianceByCategoryCardProps = Readonly<{
  categories: readonly ComplianceCategoryProgress[];
  isLoading?: boolean;
  className?: string;
}>;

/** Figma 764:1104 — fill colors per category row */
const CATEGORY_FILL_COLORS: Readonly<Record<string, string>> = {
  regulatory: "var(--ehs-blue)",
  safety: "var(--ehs-normal-blue)",
  health: "var(--ehs-gray)",
};

const CATEGORY_TRACK_CLASS =
  "absolute inset-x-0 top-[21px] h-[6px] overflow-hidden rounded-full bg-ehs-muted-text/20";

function categoryFillColor(categoryId: string, fallback: string): string {
  return CATEGORY_FILL_COLORS[categoryId.toLowerCase()] ?? fallback;
}

function categoryFillPercent(current: number, total: number): number {
  if (total <= 0 || current <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (current / total) * 100));
}

type CategoryProgressRowProps = Readonly<{
  category: ComplianceCategoryProgress;
}>;

/** One category row — Figma node 764:1113 / 764:1121 / 764:1129 */
function CategoryProgressRow(props: CategoryProgressRowProps) {
  const { category } = props;
  const percent = categoryFillPercent(category.current, category.total);
  const fillColor = categoryFillColor(category.id, category.colorHex);

  return (
    <div className="relative h-[27px] w-full">
      <div className="flex h-[17px] items-center justify-between">
        <Text as="span" className="text5 text-ehs-darker">
          {category.category}
        </Text>
        <Text as="span" className="text8 text-ehs-muted-text">
          {`${category.current}/${category.total}`}
        </Text>
      </div>

      <div
        className={CATEGORY_TRACK_CLASS}
        role="progressbar"
        aria-label={`${category.category} compliance`}
        aria-valuenow={category.current}
        aria-valuemin={0}
        aria-valuemax={category.total}
      >
        {percent > 0 ? (
          <div
            className="absolute top-0 left-0 h-[6px] rounded-full transition-[width] duration-500"
            style={{
              width: `${String(percent)}%`,
              backgroundColor: fillColor,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function CategoryProgressSkeleton() {
  return (
    <div className="relative h-[27px] w-full">
      {/* The skeleton bars are pinned to #e2e8f6, a hair lighter and bluer
          than --ehs-border (#e5e7eb). */}
      <div className="flex h-[17px] items-center justify-between">
        <div className="rounded-1.5 bg-ehs-skeleton h-4.25 w-20 animate-pulse" />
        <div className="rounded-1.5 bg-ehs-skeleton h-3.5 w-9 animate-pulse" />
      </div>
      <div className={`${CATEGORY_TRACK_CLASS} animate-pulse`} />
    </div>
  );
}

export function RegulatoryComplianceByCategoryCard(
  props: RegulatoryComplianceByCategoryCardProps,
) {
  const { categories, isLoading = false, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-[18px]"
      className={[complianceGlassCardClass, className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3.5">
        <div>
          <Text as="h3" className="text3 text-ehs-darker">
            By Category
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text mt-0.5">
            Compliance posture
          </Text>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <CategoryProgressSkeleton
                key={`category-skeleton-${String(index)}`}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            variant="plain"
            icon="mdi:chart-donut"
            title="No category stats yet"
            message="Compliance items appear here grouped by category."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <CategoryProgressRow key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </IncidentGlassCard>
  );
}
