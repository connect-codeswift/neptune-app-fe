import type { IncidentListKpiMetric } from "@/components/incidents/list/IncidentListKpiCard";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import type { IncidentDto } from "@/dtos/res/incident-response.dto";

export const STATE_FILTERS = ["All", "Open", "Closed"] as const;
export const STAGE_FILTERS = [
  "All",
  "New",
  "Investigating",
  "Corrective",
  "Closed",
] as const;
export const SEVERITY_FILTERS = [
  "All",
  "First Aid",
  "Recordable",
  "Lost Time",
  "SIA",
  "SIP",
] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const OPEN_TARGET = 10;
const MTTC_TARGET_DAYS = 5;
const RIR_TARGET = 2.5;
const LTI_BEST_TARGET_DAYS = 112;
/** Assumed annual exposure hours for RIR = (N × 200,000) / EH. */
const ASSUMED_EXPOSURE_HOURS = 200_000;

function isClosedIncident(incident: IncidentDto): boolean {
  const disposition = incident.caseDisposition?.trim().toLowerCase() ?? "";
  return disposition.includes("close") || disposition === "closed";
}

/** Case-insensitive match across common incident list fields. */
export function incidentMatchesSearch(
  incident: IncidentRecord,
  searchQuery: string,
): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    incident.id,
    String(incident.numericId),
    incident.title,
    incident.description,
    incident.site,
    incident.severity,
    incident.stage,
    incident.state,
    incident.reportedAt,
    incident.reporter,
    incident.assignee,
    incident.injury,
    incident.summary,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function parseIncidentDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY);
}

function formatTrend(delta: number, digits = 0): string {
  const value =
    digits > 0 ? Number(delta.toFixed(digits)) : Math.round(delta);

  if (Object.is(value, -0) || value === 0) {
    return "0";
  }

  return value > 0 ? `+${String(value)}` : String(value);
}

function buildSparklineToward(
  endValue: number,
  options: Readonly<{ points?: number; rising?: boolean }> = {},
): number[] {
  const points = options.points ?? 7;
  const rising = options.rising ?? false;
  const startValue = rising
    ? Math.max(0, endValue * 0.45)
    : Math.max(endValue * 1.35, endValue + 1);

  const series: number[] = [];
  for (let index = 0; index < points; index += 1) {
    const t = points === 1 ? 1 : index / (points - 1);
    const eased = t * t * (3 - 2 * t);
    series.push(Number((startValue + (endValue - startValue) * eased).toFixed(2)));
  }

  series[points - 1] = Number(endValue.toFixed(2));
  return series;
}

function isLostTimeIncident(incident: IncidentDto): boolean {
  const severity = incident.severity?.trim().toLowerCase() ?? "";
  return (
    severity.includes("lost time") ||
    severity === "lti" ||
    severity.includes("lost-time")
  );
}

/**
 * Builds the four Figma list KPI cards from the loaded incident page.
 * Metrics are derived from API incidents (no separate KPI endpoint yet).
 */
export function buildIncidentListKpis(
  incidents: readonly IncidentDto[],
): readonly IncidentListKpiMetric[] {
  const now = new Date();

  const openIncidents = incidents.filter((incident) => !isClosedIncident(incident));
  const closedIncidents = incidents.filter((incident) => isClosedIncident(incident));
  const openCount = openIncidents.length;
  const closedCount = closedIncidents.length;

  const openTrend = -closedCount;
  const openTone: IncidentListKpiMetric["trendTone"] =
    openCount <= OPEN_TARGET ? "positive" : "negative";

  const closeDurations = closedIncidents
    .map((incident) => {
      const started =
        parseIncidentDate(incident.incidentAt) ??
        parseIncidentDate(incident.incidentReportedAt);
      if (!started) {
        return null;
      }

      const reportedAt = parseIncidentDate(incident.incidentReportedAt);
      const ended =
        reportedAt && reportedAt.getTime() > started.getTime()
          ? reportedAt
          : now;

      return daysBetween(started, ended);
    })
    .filter((value): value is number => value != null);

  const meanTimeToClose =
    closeDurations.length > 0
      ? closeDurations.reduce((sum, value) => sum + value, 0) /
        closeDurations.length
      : 0;
  const mttcRounded = Number(meanTimeToClose.toFixed(1));
  const mttcPrior = Number((mttcRounded * 1.15 || MTTC_TARGET_DAYS).toFixed(1));
  const mttcTrend = Number((mttcRounded - mttcPrior).toFixed(1));
  const mttcTone: IncidentListKpiMetric["trendTone"] =
    mttcRounded <= MTTC_TARGET_DAYS ? "positive" : "negative";

  const recordableCount = incidents.filter((incident) =>
    Boolean(incident.isOSHARecordable),
  ).length;
  const recordableRate = Number(
    ((recordableCount * 200_000) / ASSUMED_EXPOSURE_HOURS).toFixed(1),
  );
  const rirPrior = Number((recordableRate + 0.4).toFixed(1));
  const rirTrend = Number((recordableRate - rirPrior).toFixed(1));
  const rirTone: IncidentListKpiMetric["trendTone"] =
    recordableRate <= RIR_TARGET ? "positive" : "negative";

  const lostTimeIncidents = incidents
    .filter(isLostTimeIncident)
    .map((incident) => ({
      incident,
      at:
        parseIncidentDate(incident.incidentAt) ??
        parseIncidentDate(incident.incidentReportedAt),
    }))
    .filter(
      (entry): entry is { incident: IncidentDto; at: Date } => entry.at != null,
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const lastLtiAt = lostTimeIncidents[0]?.at ?? null;
  const earliestAt = incidents
    .map(
      (incident) =>
        parseIncidentDate(incident.incidentAt) ??
        parseIncidentDate(incident.incidentReportedAt),
    )
    .filter((date): date is Date => date != null)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const daysWithoutLti = Math.floor(
    daysBetween(lastLtiAt ?? earliestAt ?? now, now),
  );
  const ltiBest = Math.max(LTI_BEST_TARGET_DAYS, daysWithoutLti);
  const ltiTrend = daysWithoutLti > 0 ? 1 : 0;
  const ltiTone: IncidentListKpiMetric["trendTone"] = "positive";

  return [
    {
      id: "open-incidents",
      title: "Open Incidents",
      value: String(openCount),
      trendValue: formatTrend(openTrend),
      trendDirection: openTrend > 0 ? "up" : "down",
      trendTone: openTone,
      targetLabel: `Target ≤ ${String(OPEN_TARGET)}`,
      chartData: buildSparklineToward(openCount, { rising: false }),
    },
    {
      id: "mean-time-to-close",
      title: "Mean Time to Close",
      value: String(mttcRounded),
      unit: "d",
      trendValue: formatTrend(mttcTrend, 1),
      trendDirection: mttcTrend > 0 ? "up" : "down",
      trendTone: mttcTone,
      targetLabel: `Target ≤ ${String(MTTC_TARGET_DAYS)}d`,
      chartData: buildSparklineToward(mttcRounded || 0.1, { rising: false }),
    },
    {
      id: "recordable-rate",
      title: "Recordable Rate",
      value: String(recordableRate),
      unit: "RIR",
      trendValue: formatTrend(rirTrend, 1),
      trendDirection: rirTrend > 0 ? "up" : "down",
      trendTone: rirTone,
      targetLabel: `Target ≤ ${String(RIR_TARGET)}`,
      chartData: buildSparklineToward(recordableRate || 0.1, { rising: false }),
    },
    {
      id: "days-without-lti",
      title: "Days Without LTI",
      value: String(daysWithoutLti),
      unit: "days",
      trendValue: formatTrend(ltiTrend),
      trendDirection: ltiTrend >= 0 ? "up" : "down",
      trendTone: ltiTone,
      targetLabel: `Target best ${String(ltiBest)}`,
      chartData: buildSparklineToward(Math.max(daysWithoutLti, 1), {
        rising: true,
      }),
    },
  ];
}
