/** One week of observation counts on the engagement chart. */
export type EngagementPoint = Readonly<{
  /** X-axis label, e.g. "W1". */
  label: string;
  safe: number;
  atRisk: number;
}>;

/** One attachment listed under Photo Evidence. */
export type ObservationPhoto = Readonly<{
  name: string;
  /** Human-readable file size, e.g. "1.2 MB". */
  size: string;
  /** Remote image URL when available from the API. */
  url?: string;
}>;

/** Everything the observation detail page shows. */
export type ObservationDetail = Readonly<{
  id: string;
  observer: string;
  date: string;
  time: string;
  location: string;
  category: string;
  /** Drives the badge tone on the detail page. */
  type: "Safe" | "At-Risk";
  /** Free-text account of what was seen. */
  observed: string;
  photos: readonly ObservationPhoto[];
}>;

const OBSERVATION_DETAILS: readonly ObservationDetail[] = [
  {
    id: "BBS-441",
    observer: "Sarah Mitchell",
    date: "April 22, 2025",
    time: "2:30 PM",
    location: "Plant A - Assembly",
    category: "PPE Usage",
    type: "Safe",
    observed:
      "Worker was observed properly wearing all required PPE including safety glasses, hard hat, high-visibility vest, and steel-toed boots while operating the press brake machine. Correct lockout/tagout procedures were followed before performing maintenance checks. Worker also reminded a nearby colleague to secure their face shield before grinding.",
    photos: [
      { name: "ppe_compliance_lineA.jpg", size: "1.2 MB" },
      { name: "lockout_tagout_station.jpg", size: "0.9 MB" },
    ],
  },
  {
    id: "BBS-440",
    observer: "Mike Reyes",
    date: "April 21, 2025",
    time: "10:05 AM",
    location: "Plant B - Warehouse",
    category: "Lifting Technique",
    type: "At-Risk",
    observed:
      "Worker lifted a 20kg carton from floor level using a rounded back and twisted while turning toward the pallet. No mechanical aid was used despite a trolley being available nearby. Coaching was given on the spot covering hip hinge technique and the site's two-person lift threshold.",
    photos: [{ name: "manual_handling_bayC.jpg", size: "1.4 MB" }],
  },
];

/** Detail for an observation id, or null when it isn't one we hold. */
export function getObservationDetail(id: string): ObservationDetail | null {
  return OBSERVATION_DETAILS.find((detail) => detail.id === id) ?? null;
}

/** Tone drives the bar colour; "info" is the low-severity category. */
export type BehaviorTone = "risk" | "info";

export type BehaviorCategory = Readonly<{
  label: string;
  count: number;
  tone: BehaviorTone;
}>;

/** One row in the Recent sessions table. */
export type BbsSession = Readonly<{
  /** Reference shown in the first column, e.g. "BBS-441". */
  id: string;
  type: string;
  observer: string;
  location: string;
  /** Behaviours summary, e.g. "14 of 15 safe". */
  behaviors: string;
  /** Share of behaviours observed as safe, 0-100. */
  safePercent: number;
}>;

export const RECENT_SESSIONS: readonly BbsSession[] = [
  {
    id: "BBS-441",
    type: "BBS observation",
    observer: "Sarah Mitchell",
    location: "PPE compliance",
    behaviors: "14 of 15 safe",
    safePercent: 92,
  },
  {
    id: "BBS-440",
    type: "BBS observation",
    observer: "Mike Reyes",
    location: "Lifting technique",
    behaviors: "8 of 11 safe",
    safePercent: 76,
  },
];
