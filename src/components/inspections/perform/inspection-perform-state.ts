import type { InspectionItemResponseRequestDto } from "@/dtos/req/inspection-request.dto";
import type {
  InspectionAttachmentDto,
  InspectionRecordedResponseDto,
  InspectionSnapshotDto,
} from "@/dtos/res/inspection-response.dto";
import {
  type AnswerDraft,
  type AnswerMap,
  type ChecklistEvidence,
  type ChecklistSection,
  toGrade,
} from "@/components/checklists/checklist-state";

/**
 * Inspection-shaped adapters onto the shared checklist model. Everything about
 * *performing* a checklist lives in `checklist-state`; this file only knows how
 * an inspection names its fields.
 */

/**
 * The read side has never pinned down which name it returns, so both are read.
 * This predates the perform page — see the note on InspectionRecordedResponseDto.
 */
function itemIdOf(response: InspectionRecordedResponseDto): number | null {
  return response.inspectionItemId ?? response.templateItemId ?? null;
}

/**
 * Rebuilds the page's state from the answers already recorded on the run, so
 * reopening the checklist resumes where the inspector left off.
 */
export function hydrateAnswers(
  responses: readonly InspectionRecordedResponseDto[],
): AnswerMap {
  const answers: Record<number, AnswerDraft> = {};

  responses.forEach((response) => {
    const itemId = itemIdOf(response);
    if (itemId === null) return;

    answers[itemId] = {
      // Older rows have no severity but do have valueText, which held the
      // answer word; reading it back keeps those runs resumable too.
      severity: toGrade(response.severity) ?? toGrade(response.valueText),
      note: response.note ?? "",
    };
  });

  return answers;
}

/** The run's pinned snapshot, in the order the template author arranged it. */
export function toChecklistSections(
  snapshot: InspectionSnapshotDto | null | undefined,
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
  attachments: readonly InspectionAttachmentDto[],
): ChecklistEvidence[] {
  return attachments.map((attachment) => ({
    id: attachment.id,
    itemId: attachment.inspectionItemId,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
  }));
}

/**
 * One answer as the save endpoint wants it.
 *
 * `valueText` repeats the grade on purpose: progress %, the register's answered
 * count and the report's per-section counts all still test
 * `responseOptionId | valueText | isNA` and know nothing about `severity`.
 *
 * `isNA` is always false — a question is graded or it is unfinished.
 */
export function toResponsePayload(
  inspectionItemId: number,
  draft: AnswerDraft,
): InspectionItemResponseRequestDto {
  return {
    inspectionItemId,
    // Inspection templates carry no response sets, so there is no option to point at.
    inspectionResponseOptionId: 0,
    valueText: draft.severity ?? "",
    note: draft.note.trim(),
    isNA: false,
    severity: draft.severity,
  };
}
