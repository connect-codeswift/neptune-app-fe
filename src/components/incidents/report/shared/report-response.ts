export const IMMEDIATE_ACTION_OPTIONS = [
  { id: "area-cordoned", label: "Area cordoned off" },
  { id: "loto", label: "Equipment locked out (LOTO)" },
  { id: "first-aid", label: "First aid administered" },
  { id: "supervisor-notified", label: "Supervisor notified" },
  { id: "spill-contained", label: "Spill contained" },
  { id: "photos-captured", label: "Photos captured" },
] as const;

// SUGGESTED_FOLLOW_UP_OPTIONS used to live here: three hardcoded items, one of
// them ("Review SOP for hose inspection") wired to the hose-rupture demo
// scenario. Follow-ups now come from POST /api/v1/incidents/ai/draft-assist or from the
// reporter typing their own, so there is nothing left to hardcode.
