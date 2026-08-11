import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import type { InspectionDetail } from "@/app/dashboard/inspections/inspections-data";

type Segment = Readonly<{ label: string; value: number; color: string }>;

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring chart of the inspection's item breakdown, with the total in the middle. */
function ItemsDonut(props: Readonly<{ segments: readonly Segment[] }>) {
  const { segments } = props;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const arcs = segments.reduce<
    { label: string; color: string; length: number; offset: number }[]
  >((acc, segment) => {
    const previous = acc.at(-1);
    const length = total > 0 ? (segment.value / total) * CIRCUMFERENCE : 0;

    acc.push({
      label: segment.label,
      color: segment.color,
      length,
      offset: previous ? previous.offset + previous.length : 0,
    });
    return acc;
  }, []);

  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth="15"
            strokeDasharray={`${String(arc.length)} ${String(CIRCUMFERENCE - arc.length)}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-ehs-dark-bg text-3xl leading-none tabular-nums">
          {total}
        </span>
        <span className="text-ehs-muted-text mt-1 text-xs font-bold tracking-wider uppercase">
          Items
        </span>
      </div>
    </div>
  );
}

export type InspectionDetailPanelProps = Readonly<{
  detail: InspectionDetail;
  className?: string;
  onViewFindings?: () => void;
}>;

export function InspectionDetailPanel(props: InspectionDetailPanelProps) {
  const { detail, className = "", onViewFindings } = props;

  const segments: readonly Segment[] = [
    { label: "Pass", value: detail.items.pass, color: "var(--ehs-green)" },
    { label: "Action", value: detail.items.action, color: "var(--ehs-yellow)" },
    { label: "Critical", value: detail.items.critical, color: "var(--ehs-red)" },
    { label: "Pending", value: detail.items.pending, color: "var(--ehs-muted-text)" },
  ];

  const displayCode = detail.code ?? `I-${detail.id}`;

  return (
    <IncidentGlassCard className={className} incidentGlassCardClassName="gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-ehs-dark-bg text-xl font-bold">{detail.title}</h3>
          <p className="text-ehs-muted-text">
            {`${displayCode} · ${String(detail.progress)}% complete`}
          </p>
        </div>

        {onViewFindings ? (
          <Button
            type="button"
            variant="primary"
            onClick={onViewFindings}
            className="shrink-0 rounded-[10px] px-4 py-2 text-sm font-medium"
          >
            View Findings
          </Button>
        ) : null}
      </header>

      <div className="flex items-center gap-5">
        <ItemsDonut segments={segments} />

        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              <span className="text-ehs-darker min-w-0 flex-1 truncate text-sm">
                {segment.label}
              </span>
              <span className="text-ehs-dark-bg text-sm font-bold tabular-nums">
                {segment.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {detail.topFindings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="text-ehs-muted-text text-xs font-bold tracking-wider uppercase">
            Top findings
          </h4>

          <ul className="flex flex-col">
            {detail.topFindings.map((finding) => (
              <li
                key={finding}
                className="flex items-center gap-2.5 border-t border-slate-900/10 py-2.5"
              >
                <span
                  className="bg-ehs-muted-text size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="text-ehs-darker min-w-0 flex-1 text-sm">
                  {finding}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
