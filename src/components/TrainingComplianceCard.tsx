import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";

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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Text as="span" className="text-ehs-darker text-sm font-medium">
          {label}
        </Text>
        <Text
          as="span"
          className="text-ehs-muted-text shrink-0 text-xs tabular-nums"
        >
          {`${current}% / ${target}%`}
        </Text>
      </div>

      <div className="bg-ehs-light-bg relative h-2 overflow-hidden rounded-full">
        <div
          className="bg-ehs-normal-blue absolute top-0 left-0 h-full rounded-full transition-all"
          style={{ width: `${current}%` }}
        />
        <div
          className="bg-ehs-gray absolute top-0 h-full w-px"
          style={{ left: `${target}%` }}
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
            Training Compliance
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-0.5 text-xs">
            Across all programs
          </Text>
        </div>

        <Link
          href={viewAllHref}
          className="text-ehs-gray hover:text-ehs-darker inline-flex items-center gap-0.5 text-xs font-medium transition-colors"
        >
          View all
          <Icon
            icon="mdi:chevron-right"
            className="text-sm"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {programs.map((program) => (
          <TrainingProgressRow key={program.label} {...program} />
        ))}
      </div>
    </article>
  );
}
