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

/**
 * `ActionTaken` on the wire is one string: the selected action labels joined
 * with "; ", then any free-text notes on the lines below.
 *
 * <p>Reading it back used to be `actionTaken.includes(label)` over the whole
 * string — notes included. A reporter writing "no first aid administered" in
 * their notes therefore ticked "First aid administered" on the incident record,
 * asserting an on-scene action that never happened. Only the first line is a
 * list of actions, so only the first line is ever matched against, and each
 * segment of it has to equal a label outright rather than contain one.</p>
 *
 * <p>A string whose first line is not a list of known labels is treated as
 * notes in full. That covers rows written before this and rows where the
 * reporter ticked nothing, and it is why the actions and the notes are split by
 * one function rather than parsed in two places that can disagree.</p>
 */
export function splitActionTaken(
  actionTaken: string | null | undefined,
): Readonly<{ actionLabels: readonly string[]; notes: string }> {
  const raw = actionTaken ?? "";
  if (!raw.trim()) {
    return { actionLabels: [], notes: "" };
  }

  const [firstLine = "", ...rest] = raw.split("\n");
  const segments = firstLine
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const isActionsLine =
    segments.length > 0 &&
    segments.every((segment) =>
      IMMEDIATE_ACTION_OPTIONS.some(
        (option) => option.label.toLowerCase() === segment.toLowerCase(),
      ),
    );

  if (!isActionsLine) {
    return { actionLabels: [], notes: raw.trim() };
  }

  return { actionLabels: segments, notes: rest.join("\n").trim() };
}

/** The inverse of {@link splitActionTaken}. Null when there is nothing to store. */
export function buildActionTaken(
  actionLabels: readonly string[],
  notes: string,
): string {
  const line = actionLabels.join("; ");
  const trimmedNotes = notes.trim();

  if (!line) {
    return trimmedNotes;
  }
  if (!trimmedNotes) {
    return line;
  }
  return `${line}\n${trimmedNotes}`;
}
