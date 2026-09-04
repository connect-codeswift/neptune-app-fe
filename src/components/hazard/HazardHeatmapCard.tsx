"use client";

import { Fragment, useMemo, useState } from "react";
import { useLocationsQuery } from "@/hooks/use-location-queries";
import { CardPager } from "@/components/ui/CardPager";
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
  // Floor at 36%, not 22%. The lightest tint was near enough invisible against the card,
  // so a cell holding 1 read as empty - the difference between "nothing here" and "one report"
  // is the one a heat map most needs to carry. Top of the ramp is unchanged.
  const percent = ((0.36 + ratio * 0.44) * 100).toFixed(1);
  return {
    backgroundColor: `color-mix(in oklab, var(--ehs-normal-blue) ${percent}%, transparent)`,
  };
}

const OTHER_TYPE_KEY = "__other";

/**
 * Which column a reported type belongs in.
 *
 * Matched case-insensitively: the same hazard arrives as "Mechanical" from records entered
 * against the API and "mechanical" from the form, and comparing raw strings drew both, two
 * columns wide, each holding half the reports and both labelled "Mech".
 *
 * Anything outside the standard set folds into one Other column. The report form lets a
 * reporter add a custom hazard type, so appending every value the API returns would let a site
 * grow the grid without limit until it took half the page. Eight columns at most, and no count
 * is lost - it just lands in Other.
 */
function columnKeyFor(type: string, known: ReadonlySet<string>): string {
  const normalized = type.trim().toLowerCase();
  return known.has(normalized) ? normalized : OTHER_TYPE_KEY;
}

/** Rows drawn at once. Keeps the card the same height as the one beside it. */
const ROWS_PER_PAGE = 6;

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

  const knownTypes = HEATMAP_TYPE_COLUMNS.map((type) => type.toLowerCase());
  const knownTypeSet = new Set<string>(knownTypes);

  // Summed, not assigned: several custom types share the Other column, and overwriting would
  // report only whichever the API happened to return last.
  const counts = new Map<string, number>();
  let hasOther = false;

  for (const cell of cells) {
    const column = columnKeyFor(cell.type, knownTypeSet);
    if (column === OTHER_TYPE_KEY) hasOther = true;
    const key = `${cell.location}|${column}`;
    counts.set(key, (counts.get(key) ?? 0) + cell.count);
  }

  const types = hasOther ? [...knownTypes, OTHER_TYPE_KEY] : knownTypes;

  // Busiest first, empties last. A site register can hold fifty places, and drawing them in
  // register order put a screenful of zeroes above the handful that had anything in them -
  // the concentration a heat map exists to show was below the fold. Ties fall back to the
  // name so the order is stable between renders.
  const rows = locations
    .map((location) => {
      const values = types.map((type) => counts.get(`${location}|${type}`) ?? null);
      return {
        key: location,
        label: location,
        values,
        total: values.reduce<number>((sum, value) => sum + (value ?? 0), 0),
      };
    })
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

  return {
    columns: types.map((type) => ({
      key: type,
      label: type === OTHER_TYPE_KEY ? "Other" : shortTypeLabel(type),
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

  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  // Clamped rather than reset: the row count changes when the query refetches, and a page
  // number left pointing past the end would render an empty grid.
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  return (
    <IncidentGlassCard className={className}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text3 text-ehs-darker">
            Heatmap by area
          </Text>
          <Text as="p" className="text8 text-ehs-muted-text">
            Reports last 30 days
          </Text>
        </div>
        <CardPager
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          label="areas"
        />
      </header>

      {heatMapQuery.isPending && cells == null ? (
        <SkeletonHeatmapGrid />
      ) : pageRows.length > 0 ? (
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
          {pageRows.map((row) => (
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
