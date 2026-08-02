import { CardHeading } from "@/components/CardHeading";
import { Text } from "@/components/Text";
import { GlassCard } from "@/components/ui/GlassCard";

export type TrainingProgram = Readonly<{
  label: string;
  current: number;
  target: number;
}>;

const DEFAULT_PROGRAMS: readonly TrainingProgram[] = [
  { label: "LOTO / Electrical", current: 92, target: 95 },
  { label: "Forklift Operation", current: 88, target: 90 },
  { label: "Fire Safety", current: 95, target: 95 },
  { label: "Hazard Communication", current: 72, target: 90 },
  { label: "PPE Fit Testing", current: 81, target: 90 },
  { label: "Confined Space Entry", current: 66, target: 85 },
  { label: "First Aid / CPR", current: 77, target: 85 },
];

function TrainingProgressRow(props: Readonly<TrainingProgram>) {
  const { label, current, target } = props;

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex items-center justify-between gap-3">
        <Text as="span" className="text-ehs-slate min-w-0 truncate text-[12px]">
          {label}
        </Text>
        <Text
          as="span"
          className="text-ehs-gray shrink-0 text-[11px] tabular-nums"
        >
          {`${String(current)}% / ${String(target)}%`}
        </Text>
      </div>

      <div className="relative h-[6px] w-full rounded-full bg-[rgba(136,146,163,0.18)]">
        <div
          className="bg-ehs-normal-blue h-full rounded-full transition-[width] duration-500"
          style={{ width: `${String(current)}%` }}
        />
        <div
          className="bg-ehs-gray absolute -top-[2px] -bottom-[2px] w-[2px] -translate-x-full rounded-full opacity-50"
          style={{ left: `${String(target)}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export type TrainingComplianceCardProps = Readonly<{
  programs?: readonly TrainingProgram[];
  viewAllHref?: string;
  className?: string;
}>;

export function TrainingComplianceCard(
  props: Readonly<TrainingComplianceCardProps>,
) {
  const {
    programs = DEFAULT_PROGRAMS,
    viewAllHref = "/dashboard/reports",
    className = "",
  } = props;

  return (
    <GlassCard className={className}>
      <CardHeading
        title="Training Compliance"
        subtitle="Across all programs"
        viewAllHref={viewAllHref}
      />

      <div className="mt-[7px] flex flex-col gap-3">
        {programs.map((program) => (
          <TrainingProgressRow key={program.label} {...program} />
        ))}
      </div>
    </GlassCard>
  );
}
