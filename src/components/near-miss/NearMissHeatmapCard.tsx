"use client";

import { Fragment, useMemo } from "react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { SkeletonHeatmapGrid } from "@/components/ui/skeletons";
import { useNearMissHeatMapQuery } from "@/hooks/use-near-miss-queries";
import {
  HAZARD_TYPE_SHORT_LABELS,
  LOCATION_OPTIONS,
} from "@/components/hazard/report/hazard-report-schema";
import type { SelectOption } from "@/components/form-builder";
import type { NearMissHeatMapCellDto } from "@/dtos/res/near-miss-response.dto";

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
function labelFor(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

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

/** Map a report count to the teal fill opacity used in the Figma heatmap. */
function cellStyle(value: number | null, max: number) {
  if (value == null || value <= 0) {
    return { backgroundColor: "rgba(255,255,255,0.62)" };
  }
  const ratio = max > 1 ? (value - 1) / (max - 1) : 0;
  return {
    backgroundColor: `rgba(8,145,166,${(0.22 + ratio * 0.58).toFixed(3)})`,
  };
}

/** Pivot the flat location/type tallies into the grid the card renders. */
function toGrid(cells: readonly NearMissHeatMapCellDto[]) {
  const locations = [...new Set(cells.map((cell) => cell.location))];
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
    label: labelFor(LOCATION_OPTIONS, location),
    values: types.map((type) => counts.get(`${location}|${type}`) ?? null),
  }));

  return {
    columns: types.map((type) => ({ key: type, label: shortTypeLabel(type) })),
    rows,
    max: Math.max(1, ...cells.map((cell) => cell.count), 0),
  };
}

export type NearMissHeatmapCardProps = Readonly<{ className?: string }>;

export function NearMissHeatmapCard(props: NearMissHeatmapCardProps) {
  const { className = "" } = props;

  const heatMapQuery = useNearMissHeatMapQuery();
  const cells = heatMapQuery.data?.dataModel;
  const { columns, rows, max } = useMemo(() => toGrid(cells ?? []), [cells]);

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

      {rows.length > 0 ? (
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
                    "text7 flex h-8 items-center justify-center rounded border border-slate-900/10 leading-none font-bold",
                    value != null && value >= max * 0.75
                      ? "text-white"
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
          No near misses reported in this period.
        </Text>
      )}
    </IncidentGlassCard>
  );
}
