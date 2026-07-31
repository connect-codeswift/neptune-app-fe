import { IncidentGlassCard } from "@/components/incidents";
import type {
  BehaviorCategory,
  BehaviorTone,
} from "@/app/dashboard/bbs/bbs-data";

const toneColor: Record<BehaviorTone, string> = {
  risk: "#ef4444",
  info: "#0891a6",
};

/** One category: label + count above a proportional bar. */
function BehaviorRow(
  props: Readonly<{ category: BehaviorCategory; max: number }>,
) {
  const { category, max } = props;
  const percent = max > 0 ? (category.count / max) * 100 : 0;

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-ehs-dark-bg min-w-0 truncate">
          {category.label}
        </span>
        <span className="text-ehs-dark-bg shrink-0 text-sm font-bold tabular-nums">
          {category.count}
        </span>
      </div>

      <span
        className="h-2.5 w-full overflow-hidden rounded-full bg-[#eef1f6]"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${String(percent)}%`,
            backgroundColor: toneColor[category.tone],
          }}
        />
      </span>
    </li>
  );
}

export type BbsAtRiskBehaviorsCardProps = Readonly<{
  categories: readonly BehaviorCategory[];
  className?: string;
}>;

export function BbsAtRiskBehaviorsCard(props: BbsAtRiskBehaviorsCardProps) {
  const { categories, className = "" } = props;

  // Bars are scaled against the biggest category, so the top one fills the track.
  const max = categories.reduce(
    (highest, category) => Math.max(highest, category.count),
    0,
  );

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className={["min-w-0", className].filter(Boolean).join(" ")}
      incidentGlassCardClassName="gap-4"
    >
      <header className="flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg text-lg font-bold">At-risk behaviors</h3>
        <p className="text-ehs-muted-text text-sm">Top categories observed</p>
      </header>

      {categories.length === 0 ? (
        <p className="text-ehs-muted-text text-sm">
          No at-risk behaviors observed.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {categories.map((category) => (
            <BehaviorRow
              key={category.label}
              category={category}
              max={max}
            />
          ))}
        </ul>
      )}
    </IncidentGlassCard>
  );
}
