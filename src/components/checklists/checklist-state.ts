/**
 * The parts of performing a checklist that audits and inspections share.
 *
 * The two modules are the same product feature with different table names: a run
 * off a pinned template snapshot, graded question by question. Their DTOs differ
 * only in what the item id is called (`templateItemId` against
 * `inspectionItemId`), so each module maps its own snapshot into the neutral
 * shapes here and everything downstream — the row, the tally, the submit rules —
 * is written once.
 */

/** How the auditor graded one answered question. Absent = still Pending. */
export const CHECKLIST_GRADES = ["Pass", "Action", "Critical"] as const;

export type ChecklistGrade = (typeof CHECKLIST_GRADES)[number];

/** One question, reduced to what performing the checklist actually needs. */
export type ChecklistItem = Readonly<{
  id: number;
  question: string;
  hint: string;
  isRequired: boolean;
  requireNote: boolean;
  requirePhoto: boolean;
}>;

export type ChecklistSection = Readonly<{
  id: number;
  title: string;
  description: string;
  items: readonly ChecklistItem[];
}>;

/** One piece of evidence, as the row renders it. */
export type ChecklistEvidence = Readonly<{
  id: number;
  itemId: number | null;
  fileName: string;
  mimeType: string | null;
}>;

/**
 * How one question stands right now.
 *
 * There is no "Pending" member: pending is the absence of a grade, exactly as
 * the backend sees it — a question with no usable answer gets no grade at all.
 *
 * There is no N/A either. Every question has to be graded, so a blank one is
 * unfinished work rather than a third kind of answer.
 */
export type AnswerDraft = Readonly<{
  severity: ChecklistGrade | null;
  note: string;
}>;

export type AnswerMap = Readonly<Record<number, AnswerDraft | undefined>>;

export const PENDING_ANSWER: AnswerDraft = { severity: null, note: "" };

/** A question counts as answered once it carries a grade. */
export function isAnswered(draft: AnswerDraft | undefined): boolean {
  return draft !== undefined && draft.severity !== null;
}

/** Narrows a stored grade string, tolerating casing and unknown values. */
export function toGrade(raw: string | null | undefined): ChecklistGrade | null {
  if (!raw) return null;
  const match = CHECKLIST_GRADES.find(
    (known) => known.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? null;
}

export type ChecklistTally = Readonly<{
  total: number;
  pass: number;
  action: number;
  critical: number;
  pending: number;
}>;

/**
 * The same four counts the module's `detail-summary` endpoint reports, computed
 * locally so the progress bar responds to a tap without waiting on a round trip.
 */
export function tallyAnswers(
  items: readonly ChecklistItem[],
  answers: AnswerMap,
): ChecklistTally {
  let pass = 0;
  let action = 0;
  let critical = 0;
  let pending = 0;

  items.forEach((item) => {
    const draft = answers[item.id];

    if (!isAnswered(draft)) {
      pending += 1;
      return;
    }

    if (draft?.severity === "Pass") pass += 1;
    else if (draft?.severity === "Critical") critical += 1;
    else action += 1;
  });

  return { total: items.length, pass, action, critical, pending };
}

/**
 * True when this answer still owes a note.
 *
 * Grading something Action or Critical without saying what you saw leaves a
 * finding nobody can act on, so the note is required there as well as on any
 * question the template marked `requireNote`.
 */
export function needsNote(
  item: ChecklistItem,
  draft: AnswerDraft | undefined,
): boolean {
  if (!isAnswered(draft)) return false;

  const isFailure =
    draft?.severity === "Action" || draft?.severity === "Critical";
  if (!isFailure && !item.requireNote) return false;

  return (draft?.note ?? "").trim() === "";
}

/** Questions still waiting on a grade, in checklist order. */
export function ungradedItemIds(
  items: readonly ChecklistItem[],
  answers: AnswerMap,
): number[] {
  return items
    .filter((item) => !isAnswered(answers[item.id]))
    .map((item) => item.id);
}

/** Evidence pinned to one question, in upload order. */
export function evidenceForItem(
  evidence: readonly ChecklistEvidence[],
  itemId: number,
): ChecklistEvidence[] {
  return evidence.filter((entry) => entry.itemId === itemId);
}

/** Statuses that lock a run — the backend refuses writes on all of them. */
const LOCKED_STATUSES = new Set(["submitted", "completed", "cancelled"]);

export function isRunLocked(status: string | null | undefined): boolean {
  return LOCKED_STATUSES.has((status ?? "").trim().toLowerCase());
}
