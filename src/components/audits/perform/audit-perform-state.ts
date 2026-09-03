import type { AuditItemResponseRequestDto } from "@/dtos/req/audit-request.dto";
import type {
  AuditAttachmentDto,
  AuditRecordedResponseDto,
  AuditSnapshotDto,
} from "@/dtos/res/audit-response.dto";
import {
  type AnswerDraft,
  type AnswerMap,
  type ChecklistEvidence,
  type ChecklistSection,
  toGrade,
} from "@/components/checklists/checklist-state";

/**
 * Audit-shaped adapters onto the shared checklist model. Everything about
 * *performing* a checklist lives in `checklist-state`; this file only knows how
 * an audit names its fields.
 */

/**
 * Rebuilds the page's state from the answers already recorded on the run, so
 * reopening the checklist resumes where the auditor left off instead of
 * presenting 24 blank questions over answers sitting in the database.
 */
export function hydrateAnswers(
  responses: readonly AuditRecordedResponseDto[],
): AnswerMap {
  const answers: Record<number, AnswerDraft> = {};

  responses.forEach((response) => {
    answers[response.templateItemId] = {
      // Older rows have no severity but do have valueText, which held the answer
      // word; reading it back keeps those runs resumable too. A row recorded as
      // N/A before grading existed has neither, so it comes back blank and has
      // to be graded like any other question.
      severity: toGrade(response.severity) ?? toGrade(response.valueText),
      note: response.note ?? "",
    };
  });

  return answers;
}

/** The run's pinned snapshot, in the order the template author arranged it. */
export function toChecklistSections(
  snapshot: AuditSnapshotDto | null | undefined,
): ChecklistSection[] {
  return [...(snapshot?.sections ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => ({
      id: section.id,
      title: section.sectionTitle,
      description: section.description,
      items: [...section.items]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((item) => ({
          id: item.id,
          question: item.question,
          hint: item.hint,
          isRequired: item.isRequired,
          requireNote: item.requireNote,
          requirePhoto: item.requirePhoto,
        })),
    }));
}

export function toChecklistEvidence(
  attachments: readonly AuditAttachmentDto[],
): ChecklistEvidence[] {
  return attachments.map((attachment) => ({
    id: attachment.id,
    itemId: attachment.templateItemId,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
  }));
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
    // null, never 0 — see the DTO: 0 is a value as far as `int?` is concerned.
    responseOptionId: null,
    valueText: draft.severity ?? "",
    note: draft.note.trim(),
    isNA: false,
    severity: draft.severity,
  };
}
