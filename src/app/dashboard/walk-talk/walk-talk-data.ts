/** One week of Walk & Talk trend counts. */
export type WalkTalkTrendPoint = Readonly<{
  /** X-axis label, e.g. "W1". */
  label: string;
  sessions: number;
  issues: number;
}>;

/** Tone drives the bar colour; "primary" highlights the top finding. */
export type FindingTone = "primary" | "muted";

export type WalkTalkFinding = Readonly<{
  label: string;
  count: number;
  tone: FindingTone;
}>;

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
