import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";

type HazardCategory = Readonly<{
  label: string;
  value: number;
  barColor: string;
}>;

const HAZARD_CATEGORIES: readonly HazardCategory[] = [
  { label: "Electrical", value: 28, barColor: "#067485" },
  { label: "Chemical", value: 22, barColor: "#078395" },
  { label: "Mechanical", value: 19, barColor: "#0891a6" },
  { label: "Ergonomic", value: 14, barColor: "#3aa8b8" },
  { label: "Fall hazard", value: 12, barColor: "#6cc0cc" },
  { label: "Other", value: 8, barColor: "#9ed7df" },
];

const CHART = {
  width: 320,
  height: 200,
  padLeft: 8,
  padRight: 8,
  padTop: 24,
  padBottom: 36,
} as const;

function CategoryBarChart() {
  const maxValue = Math.max(...HAZARD_CATEGORIES.map((item) => item.value));
  const plotWidth = CHART.width - CHART.padLeft - CHART.padRight;
  const plotHeight = CHART.height - CHART.padTop - CHART.padBottom;
  const barGap = 12;
  const barWidth =
    (plotWidth - barGap * (HAZARD_CATEGORIES.length - 1)) /
    HAZARD_CATEGORIES.length;

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Hazards by category chart"
    >
      {HAZARD_CATEGORIES.map((category, index) => {
        const barHeight = (category.value / maxValue) * plotHeight;
        const x = CHART.padLeft + index * (barWidth + barGap);
        const y = CHART.padTop + plotHeight - barHeight;

        return (
          <g key={category.label}>
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-ehs-darker text-[10px] font-semibold"
            >
              {category.value}
            </text>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              fill={category.barColor}
            />
            <text
              x={x + barWidth / 2}
              y={CHART.height - 10}
              textAnchor="middle"
              className="fill-ehs-muted-text text-[9px]"
            >
              {category.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export type HazardsByCategoryCardProps = Readonly<{
  total?: number;
  viewAllHref?: string;
  className?: string;
}>;

export function HazardsByCategoryCard(
  props: Readonly<HazardsByCategoryCardProps>,
) {
  const {
    total = 103,
    viewAllHref = "/dashboard/hazard",
    className = "",
  } = props;

  return (
    <article
      className={[
        "border-ehs-border bg-ehs-light-text flex flex-col gap-4 rounded-2xl border p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text as="h2" className="text-ehs-darker text-base font-bold">
            Hazards by Category
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
            {`Open · ${total} total`}
          </Text>
        </div>

        <Link
          href={viewAllHref}
          className="text-ehs-gray hover:text-ehs-darker inline-flex items-center gap-0.5 text-xs font-medium transition-colors"
        >
          View all
          <Icon icon="mdi:chevron-right" className="text-sm" aria-hidden="true" />
        </Link>
      </div>

      <CategoryBarChart />
    </article>
  );
}
