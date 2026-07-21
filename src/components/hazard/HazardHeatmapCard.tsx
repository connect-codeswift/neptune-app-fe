import { Fragment } from "react";
import { IncidentGlassCard } from "@/components/incidents";

const AREAS = ["Mech", "Elec", "Chem", "Ergo", "Slip"] as const;

type HeatmapRow = Readonly<{
  label: string;
  values: readonly (number | null)[];
}>;

const HEATMAP_ROWS: readonly HeatmapRow[] = [
  { label: "Plant A", values: [4, 2, 5, 1, 3] },
  { label: "Plant B", values: [6, 3, 1, 2, 2] },
  { label: "Whse 1", values: [2, 1, null, 3, 4] },
  { label: "Whse 2", values: [1, 1, 1, null, 2] },
  { label: "Whse 3", values: [3, 2, 1, 1, 1] },
];

// Map a report count to the teal fill opacity used in the Figma heatmap.
function cellStyle(value: number | null) {
  if (value == null) return { backgroundColor: "rgba(255,255,255,0.62)" };
  const alpha = Math.min(0.22 + (value - 1) * 0.116, 0.8);
  return { backgroundColor: `rgba(8,145,166,${alpha.toFixed(3)})` };
}

export type HazardHeatmapCardProps = Readonly<{ className?: string }>;

export function HazardHeatmapCard(props: HazardHeatmapCardProps) {
  const { className = "" } = props;

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-4 flex flex-col gap-0.5">
        <h3 className="text-ehs-dark-bg font-bold">Heatmap by area</h3>
        <p className="text-ehs-muted-text text-sm">Reports last 30 days</p>
      </header>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "auto repeat(5, minmax(0, 1fr))" }}
      >
        {/* Column header row: empty corner + category labels */}
        <span aria-hidden="true" />
        {AREAS.map((area) => (
          <span key={area} className="text-ehs-muted-text text-center text-sm">
            {area}
          </span>
        ))}

        {/* Data rows: area label + heat cells */}
        {HEATMAP_ROWS.map((row) => (
          <Fragment key={row.label}>
            <span className="text-ehs-muted-text flex items-center pr-2 text-sm whitespace-nowrap">
              {row.label}
            </span>
            {row.values.map((value, index) => (
              <div
                key={AREAS[index]}
                style={cellStyle(value)}
                className="flex h-8 items-center justify-center rounded border border-slate-900/10 text-xs font-bold"
              >
                <span
                  className={
                    value != null && value >= 4
                      ? "text-white"
                      : "text-slate-700"
                  }
                >
                  {value ?? ""}
                </span>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </IncidentGlassCard>
  );
}
