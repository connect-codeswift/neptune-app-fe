import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";

type Reporter = Readonly<{
  initials: string;
  name: string;
  role: string;
  count: number;
}>;

const REPORTERS: readonly Reporter[] = [
  { initials: "DK", name: "Dana Kim", role: "Spotter", count: 8 },
  { initials: "PM", name: "Priya Mehra", role: "Eagle eye", count: 6 },
  { initials: "ML", name: "Maria Lopez", role: "Vigilant", count: 5 },
];

export type HazardRecognitionCardProps = Readonly<{ className?: string }>;

export function HazardRecognitionCard(props: HazardRecognitionCardProps) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-3 flex flex-col gap-0.5 pb-1">
        <h3 className="text-ehs-dark-bg font-bold">Recognition</h3>
        <p className="text-ehs-muted-text text-sm">Top reporters this month</p>
      </header>

      <ul className="flex flex-col">
        {REPORTERS.map((reporter) => (
          <li
            key={reporter.initials}
            className="flex items-center gap-2.5 border-t border-slate-900/10 py-2"
          >
            <span className="bg-ehs-normal-blue/18 text-ehs-dark-blue flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
              {reporter.initials}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ehs-dark-bg truncate text-sm font-bold">
                {reporter.name}
              </span>
              <span className="text-ehs-muted-text text-xs">
                {reporter.role}
              </span>
            </div>
            <span className="text-ehs-dark-bg text-sm font-bold tabular-nums">
              {reporter.count}
            </span>
          </li>
        ))}
      </ul>
    </IncidentGlassCard>
  );
}
