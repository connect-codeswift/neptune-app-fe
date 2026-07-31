export const IMMEDIATE_ACTION_OPTIONS = [
  { id: "area-cordoned", label: "Area cordoned off" },
  { id: "loto", label: "Equipment locked out (LOTO)" },
  { id: "first-aid", label: "First aid administered" },
  { id: "supervisor-notified", label: "Supervisor notified" },
  { id: "spill-contained", label: "Spill contained" },
  { id: "photos-captured", label: "Photos captured" },
] as const;

export const SUGGESTED_FOLLOW_UP_OPTIONS = [
  { id: "root-cause", label: "Schedule root-cause analysis" },
  { id: "sop-review", label: "Review SOP for hose inspection" },
  { id: "brief-operators", label: "Brief next-shift operators" },
] as const;
