import { CardHeading } from "@/components/CardHeading";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";

export type InspectionRate = Readonly<{
  label: string;
  /** Completion rate, 0–100. */
  current: number;
  /** Goal for this category, 0–100. Drawn as a tick on the track. */
  target: number;
}>;

const DEFAULT_RATES: readonly InspectionRate[] = [
  { label: "Workplace Safety Inspection", current: 88, target: 100 },
  { label: "Fire & Emergency Equipment", current: 91, target: 100 },
  { label: "Chemical Storage Audit", current: 86, target: 100 },
  { label: "PPE Compliance Check", current: 84, target: 100 },
  { label: "Electrical Safety Audit", current: 89, target: 100 },
  { label: "Confined Space Inspection", current: 82, target: 100 },
  { label: "Environmental Monitoring", current: 91, target: 100 },
];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function InspectionRateRow(props: Readonly<InspectionRate>) {
  const { label, current, target } = props;
  const fill = clampPercent(current);
  const tick = clampPercent(target);

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-start justify-between gap-3">
        <Text as="span" className="text-ehs-slate min-w-0 truncate text-[12px]">
          {label}
        </Text>
        <p className="text-ehs-gray shrink-0 text-[11px] tabular-nums">
          {`${String(current)}%`}
          <span className="text-ehs-muted-text">{` / ${String(target)}%`}</span>
        </p>
      </div>

      <div
        className="relative h-[6px] w-full rounded-full bg-[rgba(136,146,163,0.18)]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-ehs-normal-blue h-full rounded-full transition-[width] duration-500"
          style={{ width: `${String(fill)}%` }}
        />
        {/* Target tick. Pulled fully inside the track so a 100% target stays
            visible at the right edge instead of rendering off the end. */}
        <span
          className="bg-ehs-gray absolute -top-[2px] -bottom-[2px] w-[2px] -translate-x-full rounded-full opacity-50"
          style={{ left: `${String(tick)}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export type InspectionRatesCardProps = Readonly<{
  rates?: readonly InspectionRate[];
  viewAllHref?: string;
  className?: string;
}>;

/**
 * "Inspection Rates by Categories" (Figma node 6154:27045).
 *
 * The Figma bars are drawn by hand and don't track their own labels — 86%
 * renders longer than 91% there. Here the fill is the percentage, so the bars
 * are comparable at a glance.
 */
export function InspectionRatesCard(props: Readonly<InspectionRatesCardProps>) {
  const {
    rates = DEFAULT_RATES,
    viewAllHref = "/dashboard/inspections",
    className = "",
  } = props;

  return (
    <GlassCard className={className}>
      <CardHeading
        title="Inspection Rates by Categories"
        subtitle="Across all inspection types"
        viewAllHref={viewAllHref}
      />

      <div className="mt-[7px] flex flex-col gap-3">
        {rates.map((rate) => (
          <InspectionRateRow key={rate.label} {...rate} />
        ))}
      </div>
    </GlassCard>
  );
}
