import { CardHeading } from "@/components/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";

type HazardCategory = Readonly<{
  label: string;
  /** Dense axis label when `label` is too wide for the bar slot. */
  tick: string;
  value: number;
  barColor: string;
}>;

/* `barColor` is rendered as `fill={...}`, an SVG *presentation attribute*.
   `var()` is not valid there - the browser drops the attribute and the bar
   falls back to the SVG default black - so these stay literal hex. */
const HAZARD_CATEGORIES: readonly HazardCategory[] = [
  { label: "Electrical", tick: "Electr.", value: 28, barColor: "#067485" },
  { label: "Chemical", tick: "Chem.", value: 22, barColor: "#078395" },
  { label: "Mechanical", tick: "Mech.", value: 19, barColor: "#0891a6" },
  { label: "Ergonomic", tick: "Ergo.", value: 14, barColor: "#3aa8b8" },
  { label: "Fall hazard", tick: "Fall", value: 12, barColor: "#6cc0cc" },
  { label: "Other", tick: "Other", value: 8, barColor: "#9ed7df" },
];

const CHART = {
  width: 320,
  height: 200,
  padLeft: 8,
  padRight: 8,
  padTop: 22,
  padBottom: 28,
} as const;

/** ViewBox units ≈ text8 / text7 on the rendered card (CSS rem classes don't scale with SVG). */
const TICK_SIZE = 9;
const VALUE_SIZE = 10;

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
            <title>{`${category.label}: ${String(category.value)}`}</title>
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-ehs-darker"
              fontSize={VALUE_SIZE}
              fontWeight={600}
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
              y={CHART.height - 8}
              textAnchor="middle"
              className="fill-ehs-muted-text"
              fontSize={TICK_SIZE}
            >
              {category.tick}
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
    <GlassCard className={className}>
      <CardHeading
        title="Hazards by Category"
        subtitle={`Open · ${String(total)} total`}
        viewAllHref={viewAllHref}
      />

      <CategoryBarChart />
    </GlassCard>
  );
}
