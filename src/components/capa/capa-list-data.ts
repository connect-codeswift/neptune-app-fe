/** Filter options for the CAPA register. */
export const CAPA_STATE_FILTERS = ["All", "Open", "Overdue", "Closed"] as const;

export const CAPA_PRIORITY_FILTERS = ["All", "High", "Medium", "Low"] as const;

export const CAPA_TYPE_FILTERS = ["All", "Corrective", "Preventive"] as const;

export type CapaStateFilter = (typeof CAPA_STATE_FILTERS)[number];

/** Tone for the priority / status pills. */
export type CapaBadgeTone = "high" | "medium" | "low" | "neutral" | "closed";

export function getPriorityTone(priority: string): CapaBadgeTone {
  switch (priority.toLowerCase()) {
    case "high":
    case "critical":
      return "high";
    case "medium":
    case "moderate":
      return "medium";
    case "low":
      return "low";
    default:
      return "neutral";
  }
}

export function getStatusTone(status: string): CapaBadgeTone {
  switch (status.toLowerCase()) {
    case "closed":
    case "completed":
    case "done":
      return "closed";
    case "overdue":
      return "high";
    default:
      return "neutral";
  }
}

export const CAPA_BADGE_TONE_CLASS: Record<CapaBadgeTone, string> = {
  high: "bg-ehs-red/[0.12] text-ehs-red",
  medium: "bg-ehs-yellow/[0.14] text-ehs-yellow",
  low: "bg-ehs-normal-blue/[0.12] text-ehs-dark-blue",
  closed: "bg-ehs-green/[0.14] text-ehs-green",
  neutral: "bg-ehs-light-bg text-ehs-gray",
};
