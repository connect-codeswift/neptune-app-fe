import type { FormValues } from "@/components/form-builder";
import type { FollowUpAction } from "@/components/walk-talk/log/walk-talk-form-schema";
import type { MetricCardProps } from "@/components/ui/MetricCard";
import type {
  WalkTalkActionStatus,
  WalkTalkFinding,
  WalkTalkFollowUp,
  WalkTalkParticipant,
  WalkTalkSession,
  WalkTalkSessionDetail,
  WalkTalkTrendPoint,
} from "@/app/dashboard/walk-talk/walk-talk-data";
import type {
  CreateWalkTalkFollowUpDto,
  CreateWalkTalkRequestDto,
} from "@/dtos/req/walk-talk-request.dto";
import type {
  WalkTalkDashboardCountsDto,
  WalkTalkGraphDto,
  WalkTalkSessionDto,
  WalkTalkSessionFollowUpDto,
  WalkTalkSessionParticipantDto,
  WalkTalkTopFindingDto,
} from "@/dtos/res/walk-talk-response.dto";

function asString(value: FormValues[string] | undefined): string {
  return typeof value === "string" ? value : "";
}

function asStringList(value: FormValues[string] | undefined): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Convert a date/time form value to an ISO-8601 string for the API. */
function toWalkTalkIsoDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return new Date().toISOString();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function isFollowUpEmpty(action: FollowUpAction): boolean {
  return (
    action.assignedTo.trim() === "" &&
    action.dueDate.trim() === "" &&
    action.action.trim() === ""
  );
}

function toFollowUpDto(
  action: FollowUpAction,
  fallbackDate: string,
): CreateWalkTalkFollowUpDto | null {
  const followUpTitle = action.action.trim();
  if (!followUpTitle) return null;

  return {
    followUpTitle,
    assignToId: Number(action.assignedTo) || 0,
    dueDate: toWalkTalkIsoDate(action.dueDate.trim() || fallbackDate),
  };
}

/**
 * Log form values + saved follow-ups → POST /api/walkandtalk body.
 * Includes the in-progress follow-up draft when it isn't empty.
 */
export function toCreateWalkTalkRequest(
  values: FormValues,
  savedActions: readonly FollowUpAction[],
): CreateWalkTalkRequestDto | null {
  const observer = asString(values.observer).trim();
  const dateRaw = asString(values.date).trim();
  const location = asString(values.location).trim();
  const topic = asString(values.topic).trim();
  const notes = asString(values.notes).trim();
  const participants = asStringList(values.participants)
    .map((name) => name.trim())
    .filter(Boolean);

  if (!observer || !dateRaw || !location || !topic || !notes) {
    return null;
  }

  if (participants.length === 0) {
    return null;
  }

  const date = toWalkTalkIsoDate(dateRaw);
  const draft = {
    assignedTo: asString(values.assignedTo),
    dueDate: asString(values.dueDate),
    action: asString(values.action),
  };

  const followUps = [
    ...savedActions,
    ...(isFollowUpEmpty(draft) ? [] : [draft]),
  ]
    .map((action) => toFollowUpDto(action, dateRaw))
    .filter((entry): entry is CreateWalkTalkFollowUpDto => entry !== null);

  return {
    observer,
    date,
    location,
    topics: [topic],
    notes,
    participants,
    followUps,
  };
}

function formatSessionWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSessionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatSessionTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFollowUpDueDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toFollowUpStatus(status: string | undefined): WalkTalkActionStatus {
  const normalized = status?.trim().toLowerCase() ?? "";
  if (normalized === "closed") return "Closed";
  if (normalized === "in progress" || normalized === "inprogress") {
    return "In Progress";
  }
  return "Open";
}

function toDetailParticipant(
  dto: WalkTalkSessionParticipantDto,
): WalkTalkParticipant {
  return {
    name: dto.name?.trim() || "—",
    role: "Participant",
  };
}

function toDetailFollowUp(dto: WalkTalkSessionFollowUpDto): WalkTalkFollowUp {
  return {
    action: dto.followUpTitle?.trim() || "—",
    assignedTo: dto.assignToName?.trim() || "—",
    dueDate: formatFollowUpDueDate(dto.dueDate ?? ""),
    status: toFollowUpStatus(dto.status),
  };
}

/** API session row → recent-sessions table row. */
function toWalkTalkSession(dto: WalkTalkSessionDto): WalkTalkSession {
  const topics = Array.isArray(dto.topics)
    ? dto.topics.map((topic) => topic.trim()).filter(Boolean)
    : [];

  return {
    id: `WT-${String(dto.id)}`,
    type: "Walk & Talk",
    observer: dto.observer?.trim() || dto.userName?.trim() || "—",
    focusArea: topics.length > 0 ? topics.join(", ") : "—",
    when: formatSessionWhen(dto.date || dto.createdAt || ""),
    site: dto.location?.trim() || "—",
  };
}

export function toWalkTalkSessions(
  sessions: readonly WalkTalkSessionDto[],
): WalkTalkSession[] {
  return sessions.map(toWalkTalkSession);
}

/** Dashboard counts payload → MetricCard props. */
export function toWalkTalkMetricCards(
  counts: WalkTalkDashboardCountsDto | null | undefined,
): readonly MetricCardProps[] {
  // Counts only — the endpoint carries no history or prior period, so both
  // cards show an icon badge rather than a delta.
  return [
    {
      title: "Observations (30d)",
      value: counts?.totalObservationsCount ?? 0,
      description: "Logged in the last 30 days",
      icon: "mdi:eye-outline",
    },
    {
      title: "Walk & Talks",
      value: counts?.totalWalkAndTalkCount ?? 0,
      description: "Sessions completed",
      icon: "mdi:walk",
    },
  ];
}

/** Top findings payload → card rows (highest count first). */
export function toWalkTalkTopFindings(
  payload: readonly WalkTalkTopFindingDto[] | null | undefined,
): readonly WalkTalkFinding[] {
  const findings = [...(payload ?? [])]
    .map((finding): WalkTalkFinding => ({
      label: finding.topic?.trim() || "—",
      count: finding.count ?? 0,
      tone: "muted",
    }))
    .sort((left, right) => right.count - left.count);

  return findings.map((finding, index) => ({
    ...finding,
    tone: index === 0 ? "primary" : "muted",
  }));
}

function toWeekLabel(weekStart: string, index: number): string {
  const date = new Date(weekStart);
  if (Number.isNaN(date.getTime())) {
    return `W${String(index + 1)}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Graph payload → trends chart points. */
export function toWalkTalkTrendPoints(
  payload: WalkTalkGraphDto | null | undefined,
): readonly WalkTalkTrendPoint[] {
  const points = payload?.graph ?? [];

  return points.map((point, index) => ({
    label: toWeekLabel(point.weekStart, index),
    sessions: point.count ?? 0,
    issues: 0,
  }));
}

/** API session detail → session detail page model. */
export function toWalkTalkSessionDetail(
  dto: WalkTalkSessionDto,
): WalkTalkSessionDetail {
  const topics = Array.isArray(dto.topics)
    ? dto.topics.map((topic) => topic.trim()).filter(Boolean)
    : [];
  const location = dto.location?.trim() || "—";

  return {
    id: `WT-${String(dto.id)}`,
    observer: dto.observer?.trim() || dto.userName?.trim() || "—",
    date: formatSessionDate(dto.date || ""),
    time: formatSessionTime(dto.createdAt || dto.date || ""),
    location,
    topic: topics.length > 0 ? topics.join(", ") : "—",
    site: location,
    notes: dto.notes?.trim() || "—",
    participants: (dto.participants ?? []).map(toDetailParticipant),
    followUps: (dto.followUps ?? []).map(toDetailFollowUp),
  };
}
