import {
  AUDIT_SEVERITIES,
  type AuditItemResponseRequestDto,
  type AuditSeverity,
} from "@/dtos/req/audit-request.dto";
import type {
  AuditAttachmentDto,
  AuditRecordedResponseDto,
  AuditSnapshotDto,
  AuditSnapshotItemDto,
  AuditSnapshotSectionDto,
} from "@/dtos/res/audit-response.dto";

/**
 * How one question stands right now.
 *
 * There is no "Pending" member: pending is the absence of a grade, exactly as
 * the backend sees it — a question with no usable answer gets no grade at all.
 *
 * There is no N/A either. Every question on an audit has to be graded, so a
 * blank one is unfinished work rather than a third kind of answer.
 */
export type AnswerDraft = Readonly<{
  severity: AuditSeverity | null;
  note: string;
}>;

export type AnswerMap = Readonly<Record<number, AnswerDraft | undefined>>;

export const PENDING_ANSWER: AnswerDraft = {
  severity: null,
  note: "",
};

/** A question counts as answered once it carries a grade. */
export function isAnswered(draft: AnswerDraft | undefined): boolean {
  return draft !== undefined && draft.severity !== null;
}

/** Narrows a stored severity string, tolerating casing and unknown values. */
export function toSeverity(
  raw: string | null | undefined,
): AuditSeverity | null {
  if (!raw) return null;
  const match = AUDIT_SEVERITIES.find(
    (known) => known.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? null;
}

/**
 * Rebuilds the page's state from the answers already recorded on the run, so
 * reopening the checklist resumes where the auditor left off instead of
 * presenting 24 blank questions over answers that are sitting in the database.
 */
export function hydrateAnswers(
  responses: readonly AuditRecordedResponseDto[],
): AnswerMap {
  const answers: Record<number, AnswerDraft> = {};

  responses.forEach((response) => {
    answers[response.templateItemId] = {
      // Older rows have no severity but do have valueText, which held the
      // answer word; reading it back keeps those runs resumable too. A row
      // recorded as N/A before grading existed has neither, so it comes back
      // blank and has to be graded like any other question.
      severity: toSeverity(response.severity) ?? toSeverity(response.valueText),
      note: response.note ?? "",
    };
  });

  return answers;
}

/** Sections and their items in the order the template author arranged them. */
export function orderedSections(
  snapshot: AuditSnapshotDto | null | undefined,
): AuditSnapshotSectionDto[] {
  return [...(snapshot?.sections ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => ({
      ...section,
      items: [...section.items].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      ),
    }));
}

export type AuditTally = Readonly<{
  total: number;
  pass: number;
  action: number;
  critical: number;
  pending: number;
}>;

/**
 * The same four counts `GET /audits/{id}/detail-summary` reports, computed
 * locally so the progress bar responds to a tap without waiting on a round
 * trip. A question with no grade is Pending.
 */
export function tallyAnswers(
  items: readonly AuditSnapshotItemDto[],
  answers: AnswerMap,
): AuditTally {
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
  item: AuditSnapshotItemDto,
  draft: AnswerDraft | undefined,
): boolean {
  if (!isAnswered(draft)) return false;

  const isFailure =
    draft?.severity === "Action" || draft?.severity === "Critical";
  if (!isFailure && !item.requireNote) return false;

  return (draft?.note ?? "").trim() === "";
}

/** Evidence pinned to one question, in upload order. */
export function attachmentsForItem(
  attachments: readonly AuditAttachmentDto[],
  itemId: number,
): AuditAttachmentDto[] {
  return attachments.filter(
    (attachment) => attachment.templateItemId === itemId,
  );
}

/** Questions still waiting on a grade, in checklist order. */
export function ungradedItemIds(
  items: readonly AuditSnapshotItemDto[],
  answers: AnswerMap,
): number[] {
  return items
    .filter((item) => !isAnswered(answers[item.id]))
    .map((item) => item.id);
}

/**
 * One answer as the save endpoint wants it.
 *
 * `valueText` repeats the grade on purpose. Progress %, the register's answered
 * count and the report's per-section counts all still test
 * `responseOptionId | valueText | isNA` and know nothing about `severity`, and
 * the read-only checklist tab renders `valueText` as the answer. Sending the
 * grade word keeps every one of those correct.
 *
 * `isNA` is always false: an audit question is graded or it is unfinished.
 * Clearing a grade sends an empty valueText, which is how the backend is told
 * the question went back to unanswered.
 */
export function toResponsePayload(
  templateItemId: number,
  draft: AnswerDraft,
): AuditItemResponseRequestDto {
  return {
    templateItemId,
    // Audit templates carry no response sets, so there is no option to point at.
    responseOptionId: 0,
    valueText: draft.severity ?? "",
    note: draft.note.trim(),
    isNA: false,
    severity: draft.severity,
  };
}
