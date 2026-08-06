/** Backend status values — exact casing from the API contract. */
export const RUN_STATUS = {
  scheduled: "Scheduled",
  inProgress: "InProgress",
  submitted: "Submitted",
  completed: "Completed",
  overdue: "Overdue",
  cancelled: "Cancelled",
} as const;

/** Display labels shown in register chips and table badges. */
export const REGISTER_STATUS_FILTERS = [
  "All",
  "Scheduled",
  "In progress",
  "Submitted",
  "Closed",
  "Overdue",
  "Cancelled",
] as const;

export type RegisterStatusFilter = (typeof REGISTER_STATUS_FILTERS)[number];

const DISPLAY_BY_API: Record<string, string> = {
  [RUN_STATUS.inProgress]: "In progress",
  [RUN_STATUS.completed]: "Closed",
};

const API_BY_DISPLAY: Record<string, string> = {
  "In progress": RUN_STATUS.inProgress,
  Closed: RUN_STATUS.completed,
};

/** Turn an API status into a user-facing label. */
export function formatRunStatus(status: string): string {
  const trimmed = status.trim();
  return DISPLAY_BY_API[trimmed] ?? trimmed;
}

/** Map a toolbar filter label to the API query value; `All` → undefined. */
export function toApiStatusFilter(
  displayStatus: RegisterStatusFilter | string,
): string | undefined {
  if (displayStatus === "All") return undefined;
  return API_BY_DISPLAY[displayStatus] ?? displayStatus;
}
