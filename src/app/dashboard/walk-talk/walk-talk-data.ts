/** One week of Walk & Talk trend counts. */
export type WalkTalkTrendPoint = Readonly<{
  /** X-axis label, e.g. "W1". */
  label: string;
  sessions: number;
  issues: number;
}>;

export const WALK_TALK_TRENDS: readonly WalkTalkTrendPoint[] = [
  { label: "W1", sessions: 6, issues: 2 },
  { label: "W2", sessions: 7, issues: 3 },
  { label: "W3", sessions: 8, issues: 2 },
  { label: "W4", sessions: 9, issues: 4 },
  { label: "W5", sessions: 10, issues: 3 },
  { label: "W6", sessions: 11, issues: 5 },
  { label: "W7", sessions: 12, issues: 4 },
  { label: "W8", sessions: 14, issues: 6 },
];

/** Tone drives the bar colour; "primary" highlights the top finding. */
export type FindingTone = "primary" | "muted";

export type WalkTalkFinding = Readonly<{
  label: string;
  count: number;
  tone: FindingTone;
}>;

export const TOP_FINDINGS: readonly WalkTalkFinding[] = [
  { label: "PPE compliance", count: 18, tone: "primary" },
  { label: "Housekeeping", count: 12, tone: "muted" },
  { label: "Ergonomics", count: 8, tone: "muted" },
  { label: "Chemical handling", count: 5, tone: "muted" },
  { label: "Slip/trip/fall hazards", count: 4, tone: "muted" },
];

/** One row in the Recent sessions table. */
export type WalkTalkSession = Readonly<{
  /** Reference shown in the first column, e.g. "WT-118". */
  id: string;
  type: string;
  observer: string;
  focusArea: string;
  /** Relative time under the focus area, e.g. "Today · 11:00". */
  when: string;
  site: string;
}>;

export const RECENT_SESSIONS: readonly WalkTalkSession[] = [
  {
    id: "WT-118",
    type: "Walk & Talk",
    observer: "Alicia Chen",
    focusArea: "Forklift / pedestrian",
    when: "Today · 11:00",
    site: "Warehouse 1",
  },
  {
    id: "WT-117",
    type: "Walk & Talk",
    observer: "Priya Mehra",
    focusArea: "Respiratory protection",
    when: "Yesterday",
    site: "Plant B · Paint",
  },
];

/** Participant listed on the session detail page. */
export type WalkTalkParticipant = Readonly<{
  name: string;
  role: string;
}>;

export type WalkTalkActionStatus = "Open" | "Closed" | "In Progress";

/** Follow-up action row on the session detail page. */
export type WalkTalkFollowUp = Readonly<{
  action: string;
  assignedTo: string;
  dueDate: string;
  status: WalkTalkActionStatus;
}>;

/** Everything the Walk & Talk session detail page shows. */
export type WalkTalkSessionDetail = Readonly<{
  id: string;
  observer: string;
  date: string;
  time: string;
  location: string;
  topic: string;
  site: string;
  notes: string;
  participants: readonly WalkTalkParticipant[];
  followUps: readonly WalkTalkFollowUp[];
}>;

const SESSION_DETAILS: readonly WalkTalkSessionDetail[] = [
  {
    id: "WT-118",
    observer: "Evans Gifford",
    date: "April 22, 2025",
    time: "9:30 AM - 10:15 AM",
    location: "Plant A - Line 2",
    topic: "PPE Compliance",
    site: "Plant A - Line 2",
    notes:
      "Discussed proper PPE usage in the welding area. Observed that face shields were not being worn consistently during grinding operations. Team acknowledged the gap and committed to buddy-checks before starting work. Also reviewed chemical splash protection requirements near the acid bath station.",
    participants: [
      { name: "Blake Chan", role: "Operator" },
      { name: "Sarah Lee", role: "Technician" },
    ],
    followUps: [
      {
        action: "Order additional face shields for grinding station",
        assignedTo: "Blake Chan",
        dueDate: "Apr 29, 2025",
        status: "Open",
      },
      {
        action: "Update PPE signage near acid bath",
        assignedTo: "Sarah Lee",
        dueDate: "Apr 25, 2025",
        status: "In Progress",
      },
    ],
  },
  {
    id: "WT-117",
    observer: "Priya Mehra",
    date: "April 21, 2025",
    time: "2:00 PM - 2:45 PM",
    location: "Plant B · Paint",
    topic: "Respiratory protection",
    site: "Plant B · Paint",
    notes:
      "Reviewed respirator fit-check procedure with the paint-booth crew. One cartridge change log was incomplete; coaching given on documenting changes before each shift. Confirmed spare cartridges are stocked at the booth staging area.",
    participants: [
      { name: "Mike Reyes", role: "Supervisor" },
      { name: "Jordan Park", role: "Painter" },
    ],
    followUps: [
      {
        action: "Restock P100 cartridges at booth staging",
        assignedTo: "Jordan Park",
        dueDate: "Apr 24, 2025",
        status: "Open",
      },
    ],
  },
];

/** Detail for a session id, or null when it isn't one we hold. */
export function getWalkTalkSessionDetail(
  id: string,
): WalkTalkSessionDetail | null {
  return SESSION_DETAILS.find((detail) => detail.id === id) ?? null;
}