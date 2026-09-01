import type { TimelineEvent } from "@/components/incidents/detail/incident-detail-types";
import type { IncidentActivityDto } from "@/dtos/res/incident-activity-response.dto";

/**
 * Real history → the timeline the detail screen renders.
 *
 * The timeline used to be built from the incident's own field values, which meant every entry
 * except "incident occurred" carried `IncidentReportedAt`: a column of identical times, with
 * "incident closed" claiming the moment the report was filed. These rows are written when the
 * thing happens, so the times are the times.
 */

const EVENT_TITLES: Readonly<Record<string, string>> = {
  Created: "Incident reported",
  Updated: "Incident updated",
  ClosureDraftSaved: "Closure draft saved",
  Closed: "Incident closed",
  CapaLinked: "CAPA raised",
};

const EVENT_ICONS: Readonly<Record<string, string>> = {
  Created: "mdi:file-document-outline",
  Updated: "mdi:pencil-outline",
  ClosureDraftSaved: "mdi:content-save-outline",
  Closed: "mdi:lock-check-outline",
  CapaLinked: "mdi:clipboard-check-outline",
};

/** Unknown types still render: a new event type on the server must not blank the timeline. */
function titleFor(eventType: string): string {
  return EVENT_TITLES[eventType] ?? eventType;
}

function describe(eventType: string, detail: string | null): string {
  if (!detail) {
    return "";
  }

  if (eventType === "Updated") {
    return `Changed ${detail}.`;
  }
  if (eventType === "Closed") {
    return `Closed as ${detail}.`;
  }
  if (eventType === "CapaLinked") {
    return detail;
  }
  return detail;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase();
}

/**
 * Formats the instant the row records. Parsed as UTC when the API omits the suffix: the column
 * is `timestamp with time zone` and the value is always UTC, and letting the browser read a
 * bare string as local time would shift every entry by the viewer's offset.
 */
function formatActivityTime(raw: string): string {
  const normalized = /(Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function mapIncidentActivityToTimelineEvents(
  rows: readonly IncidentActivityDto[],
): TimelineEvent[] {
  return rows.map((row, index) => {
    const eventType = row.eventType?.trim() ?? "";
    const actorName = row.userName?.trim() ?? "";
    const detail = row.detail?.trim() ?? null;

    return {
      id:
        row.id != null
          ? `activity-${String(row.id)}`
          : `activity-i${String(index)}`,
      title: titleFor(eventType),
      description: describe(eventType, detail),
      time: row.createdAt ? formatActivityTime(row.createdAt) : "—",
      // "Unknown" rather than a placeholder name: the row records that someone did this and
      // the account has since gone, which is not the same as inventing who it was.
      actorName: actorName || "Unknown",
      actorInitials: actorName ? initialsFrom(actorName) : "—",
      actorRole: undefined,
      icon: EVENT_ICONS[eventType] ?? "mdi:circle-small",
    };
  });
}
