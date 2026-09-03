"use client";

import { Fragment, useMemo } from "react";
import { useLocationsQuery } from "@/hooks/use-location-queries";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { SkeletonHeatmapGrid } from "@/components/ui/skeletons";
import { useHazardHeatMapQuery } from "@/hooks/use-hazard-queries";
import {
  HAZARD_TYPE_SHORT_LABELS,
} from "@/components/hazard/report/hazard-report-schema";
import type { SelectOption } from "@/components/form-builder";
import type { HazardHeatMapCellDto } from "@/dtos/res/hazard-response.dto";

/* The cell label is pinned to `text-slate-700` (#334155); `--ehs-slate`
   (#2a3446) is a different grey. */

/**
 * Fixed heatmap columns — design baseline (Mech…Slip) plus Fire / Envt.
 * Extra API types append after these so custom categories still appear.
 */
const HEATMAP_TYPE_COLUMNS = [
  "mechanical",
  "electrical",
  "chemical",
  "ergonomic",
  "slip-trip-fall",
  "fire-explosion",
  "environmental",
] as const;

/** Slugs come back from the API; show the label the reporter picked. */
/**
 * Short column label for a hazard type, e.g. "mechanical" -> "Mech". Custom
 * types aren't in the map, so fall back to their first four letters.
 */
function shortTypeLabel(type: string): string {
  const known = HAZARD_TYPE_SHORT_LABELS[type];
  if (known) return known;

  const word = type.split(/[-\s/]+/)[0] ?? type;
  return word.slice(0, 4).replace(/^./, (char) => char.toUpperCase());
}

/**
 * Map a report count to the teal fill opacity used in the Figma heatmap.
 *
 * `color-mix()` rather than a literal `rgba()`: the ramp needs a computed alpha, which a bare
 * `var(--ehs-...)` cannot carry, and the hardcoded white and teal it replaced could not follow
 * the theme -- every empty cell in the grid stayed white on a dark page.
 */
function cellStyle(value: number | null, max: number) {
  if (value == null || value <= 0) {
    return {
      backgroundColor:
        "color-mix(in oklab, var(--ehs-surface) 62%, transparent)",
    };
  }
  const ratio = max > 1 ? (value - 1) / (max - 1) : 0;
  const percent = ((0.22 + ratio * 0.58) * 100).toFixed(1);
  return {
    backgroundColor: `color-mix(in oklab, var(--ehs-normal-blue) ${percent}%, transparent)`,
  };
}

/** Pivot the flat location/type tallies into the grid the card renders. */
function toGrid(
  cells: readonly HazardHeatMapCellDto[],
  registerLocations: readonly string[],
) {
  // Rows come from the site's location register rather than a list hardcoded here. The six
  // placeholder areas that used to seed this were not the places anyone reports against, so
  // the grid drew six permanently empty rows and pushed the real ones off the end.
  //
  // Whatever the API reports that is not in the register still follows it: records predating
  // the register carry free text, and dropping them would hide real reports.
  const apiLocations = [...new Set(cells.map((cell) => cell.location))];
  const registerSet = new Set(registerLocations);
  const locations = [
    ...registerLocations,
    ...apiLocations.filter((location) => !registerSet.has(location)),
  ];

  const apiTypes = [...new Set(cells.map((cell) => cell.type))];
  const knownTypeSet = new Set<string>(HEATMAP_TYPE_COLUMNS);
  const types = [
    ...HEATMAP_TYPE_COLUMNS,
    ...apiTypes.filter((type) => !knownTypeSet.has(type)),
  ];

  const counts = new Map(
    cells.map((cell) => [`${cell.location}|${cell.type}`, cell.count]),
  );

  const rows = locations.map((location) => ({
    key: location,
    label: location,
    values: types.map((type) => counts.get(`${location}|${type}`) ?? null),
  }));

  return {
    columns: types.map((type) => ({
      key: type,
      label: shortTypeLabel(type),
    })),
    rows,
    max: Math.max(1, ...cells.map((cell) => cell.count), 0),
  };
}

export type HazardHeatmapCardProps = Readonly<{ className?: string }>;

export function HazardHeatmapCard(props: HazardHeatmapCardProps) {
  const { className = "" } = props;

  const heatMapQuery = useHazardHeatMapQuery();
  const cells = heatMapQuery.data?.dataModel;
  const locationsQuery = useLocationsQuery();
  const registerLocations = useMemo(
    () => (locationsQuery.data ?? []).map((location) => location.name),
    [locationsQuery.data],
  );
  const { columns, rows, max } = useMemo(
    () => toGrid(cells ?? [], registerLocations),
    [cells, registerLocations],
  );

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-4 flex flex-col gap-0.5">
        <Text as="h3" className="text3 text-ehs-darker">
          Heatmap by area
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text">
          Reports last 30 days
        </Text>
      </header>

      {heatMapQuery.isPending && cells == null ? (
        <SkeletonHeatmapGrid />
      ) : rows.length > 0 ? (
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `auto repeat(${String(columns.length)}, minmax(0, 1fr))`,
          }}
        >
          {/* Column header row: empty corner + hazard type labels */}
          <span aria-hidden="true" />
          {columns.map((column) => (
            <Text
              key={column.key}
              as="span"
              className="text8 text-ehs-muted-text truncate text-center"
            >
              {column.label}
            </Text>
          ))}

          {/* Data rows: location label + heat cells */}
          {rows.map((row) => (
            <Fragment key={row.key}>
              <Text
                as="span"
                className="text8 text-ehs-muted-text flex items-center pr-2 whitespace-nowrap"
              >
                {row.label}
              </Text>
              {row.values.map((value, index) => (
                <div
                  key={columns[index].key}
                  style={cellStyle(value, max)}
                  className={[
                    "text7 border-ehs-border-ink/10 flex h-8 items-center justify-center rounded border leading-none font-bold",
                    value != null && value >= max * 0.75
                      ? "text-ehs-on-accent"
                      : "text-slate-700",
                  ].join(" ")}
                >
                  {value == null || value <= 0 ? "0" : String(value)}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      ) : heatMapQuery.isPending ? (
        <SkeletonHeatmapGrid />
      ) : (
        <Text as="p" className="text8 text-ehs-muted-text">
          No hazards reported in this period.
        </Text>
      )}
    </IncidentGlassCard>
  );
}
