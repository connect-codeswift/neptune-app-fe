"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/skeletons";
import type { AuditItemResponseRequestDto } from "@/dtos/req/audit-request.dto";
import {
  useAddAuditAttachmentMutation,
  useDeleteAuditAttachmentMutation,
  useSaveAuditResponsesMutation,
  useSubmitAuditMutation,
} from "@/hooks/use-audit-mutations";
import { useAuditDetailQuery } from "@/hooks/use-audit-queries";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { readSubmitBlockers } from "@/lib/audit-inspection-errors";
import { getCurrentUser } from "@/lib/current-user";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import { toast } from "@/lib/toast";
import { ChecklistHeader } from "@/components/checklists/ChecklistHeader";
import {
  checklistRowId,
  ChecklistItemRow,
} from "@/components/checklists/ChecklistItemRow";
import { ChecklistTallyCard } from "@/components/checklists/ChecklistTally";
import {
  type AnswerDraft,
  type AnswerMap,
  evidenceForItem,
  isRunLocked,
  needsNote,
  tallyAnswers,
  ungradedItemIds,
} from "@/components/checklists/checklist-state";
import { ReopenAuditDialog } from "./ReopenAuditDialog";
import {
  hydrateAnswers,
  toChecklistEvidence,
  toChecklistSections,
  toResponsePayload,
} from "./audit-perform-state";

/** A grade is one tap and wants to feel committed; a note is still being typed. */
const GRADE_SAVE_DELAY_MS = 400;
const NOTE_SAVE_DELAY_MS = 900;

type SaveState = "idle" | "saving" | "saved" | "error";

export type AuditPerformContentProps = Readonly<{ auditId: string }>;

export function AuditPerformContent(props: AuditPerformContentProps) {
  const { auditId } = props;
  const router = useRouter();

  const detailQuery = useAuditDetailQuery(auditId);
  const audit = detailQuery.data?.dataModel ?? null;

  const saveResponses = useSaveAuditResponsesMutation();
  const submitAudit = useSubmitAuditMutation();
  const addAttachment = useAddAuditAttachmentMutation();
  const deleteAttachment = useDeleteAuditAttachmentMutation();

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [blockedIds, setBlockedIds] = useState<readonly number[]>([]);
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  /**
   * Answers are hydrated once per run rather than on every refetch. Saving
   * invalidates the audit queries, so re-hydrating on each response would
   * overwrite whatever the auditor typed while the request was in flight.
   */
  const hydratedForRef = useRef<string | null>(null);
  /** Items changed but not yet written, keyed by question id. */
  const dirtyRef = useRef(new Map<number, AnswerDraft>());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!audit || hydratedForRef.current === auditId) return;
    hydratedForRef.current = auditId;
    setAnswers(hydrateAnswers(audit.responses ?? []));
  }, [audit, auditId]);

  const sections = useMemo(() => toChecklistSections(audit?.snapshot), [audit]);
  const items = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );
  const tally = useMemo(() => tallyAnswers(items, answers), [items, answers]);

  const isLocked = isRunLocked(audit?.status);

  /** Writes every pending change in one request — the endpoint takes a batch. */
  const flushSaves = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const pending = dirtyRef.current;
    if (pending.size === 0) return;

    const responses: AuditItemResponseRequestDto[] = [...pending.entries()].map(
      ([itemId, draft]) => toResponsePayload(itemId, draft),
    );
    // Cleared before awaiting so a change made during the request is not lost
    // with the batch it was never part of.
    dirtyRef.current = new Map();

    const { userId, siteId } = getCurrentUser();
    setSaveState("saving");

    try {
      await saveResponses.mutateAsync({
        auditId,
        payload: { userId, siteId, responses },
      });
      setSaveState("saved");
    } catch (error) {
      setSaveState("error");
      toast.error(
        getMutationErrorMessage(error, "Could not save your last answer."),
      );
    }
  }, [auditId, saveResponses]);

  const queueSave = useCallback(
    (itemId: number, draft: AnswerDraft, delayMs: number) => {
      dirtyRef.current.set(itemId, draft);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void flushSaves();
      }, delayMs);
    },
    [flushSaves],
  );

  const handleAnswerChange = useCallback(
    (itemId: number, next: AnswerDraft) => {
      setAnswers((previous) => ({ ...previous, [itemId]: next }));
      // Clear the row's blocked outline as soon as it is being dealt with.
      setBlockedIds((previous) => previous.filter((id) => id !== itemId));

      const previousNote = answers[itemId]?.note ?? "";
      const isNoteEdit = previousNote !== next.note;
      queueSave(
        itemId,
        next,
        isNoteEdit ? NOTE_SAVE_DELAY_MS : GRADE_SAVE_DELAY_MS,
      );
    },
    [answers, queueSave],
  );

  const handleAttach = useCallback(
    (itemId: number, file: File) => {
      // No size or type check here: `uploadFile` validates against the same
      // module rules the server enforces at upload-intent, so a second copy of
      // those numbers here would only drift from them.
      setUploadingItemId(itemId);

      addAttachment.mutate(
        { auditId, file, templateItemId: itemId },
        {
          onSuccess: () => {
            toast.success("Evidence attached");
          },
          onError: (error) => {
            toast.error(
              getMutationErrorMessage(error, "Could not attach that file."),
            );
          },
          onSettled: () => {
            setUploadingItemId(null);
          },
        },
      );
    },
    [addAttachment, auditId],
  );

  const handleRemoveAttachment = useCallback(
    (attachmentId: number) => {
      deleteAttachment.mutate(
        { auditId, attachmentId },
        {
          onSuccess: () => {
            toast.success("Evidence removed");
          },
          onError: (error) => {
            toast.error(
              getMutationErrorMessage(error, "Could not remove that file."),
            );
          },
        },
      );
    },
    [auditId, deleteAttachment],
  );

  /** Scrolls the first offending question into view and outlines them all. */
  const highlightBlocked = useCallback((ids: readonly number[]) => {
    setBlockedIds(ids);
    const [first] = ids;
    if (first === undefined) return;

    document
      .querySelector(`#${checklistRowId(first)}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  /**
   * Runs the checks first and only then opens the confirmation. Asking someone
   * to confirm and *then* telling them the checklist is incomplete wastes the
   * one decision the dialog exists to take.
   */
  const handleRequestSubmit = useCallback(async () => {
    // A note typed a moment ago is still on a timer; submitting without
    // writing it first would lose it and fail the backend's evidence check.
    await flushSaves();

    // Every question has to be graded, not just the ones the template marked
    // required — each one is a check somebody decided was worth making, and a
    // blank leaves the record ambiguous about whether it was looked at. The
    // backend only enforces `IsRequired`, so this is the stricter rule and it
    // has to live here.
    const ungraded = ungradedItemIds(items, answers);
    if (ungraded.length > 0) {
      highlightBlocked(ungraded);
      toast.error(
        `Grade ${String(ungraded.length)} remaining ${
          ungraded.length === 1 ? "question" : "questions"
        } before submitting.`,
      );
      return;
    }

    // The "explain an Action or a Critical" rule is this page's, not the
    // backend's, so it has to be checked here or it is not checked at all.
    const unexplained = items
      .filter((item) => needsNote(item, answers[item.id]))
      .map((item) => item.id);

    if (unexplained.length > 0) {
      highlightBlocked(unexplained);
      toast.error(
        `Add a note to ${String(unexplained.length)} graded ${
          unexplained.length === 1 ? "question" : "questions"
        } before submitting.`,
      );
      return;
    }

    setIsConfirmingSubmit(true);
  }, [answers, flushSaves, highlightBlocked, items]);

  const handleSubmit = useCallback(() => {
    setIsConfirmingSubmit(false);
    const { userId, siteId } = getCurrentUser();

    submitAudit.mutate(
      { auditId, payload: { userId, siteId } },
      {
        onSuccess: (response) => {
          const raised = response.dataModel?.autoRaisedFindings ?? 0;
          toast.success(
            raised > 0
              ? `Audit submitted — ${String(raised)} ${raised === 1 ? "finding" : "findings"} raised.`
              : "Audit submitted",
          );
          router.push(`/dashboard/audits/${encodeURIComponent(auditId)}`);
        },
        onError: (error) => {
          const blockers = readSubmitBlockers(error);
          const ids = [
            ...blockers.unanswered,
            ...blockers.missingNotes,
            ...blockers.missingPhotos,
          ];

          if (ids.length > 0) highlightBlocked(ids);
          toast.error(
            getMutationErrorMessage(error, "Could not submit this audit."),
          );
        },
      },
    );
  }, [auditId, highlightBlocked, router, submitAudit]);

  // Losing a half-typed note to a stray back-navigation is worth one prompt.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current.size === 0) return;
      event.preventDefault();
    };

    globalThis.addEventListener("beforeunload", warn);
    return () => {
      globalThis.removeEventListener("beforeunload", warn);
    };
  }, []);

  useEffect(() => {
    const timer = saveTimerRef.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (detailQuery.isPending) {
    return (
      <div className="px-4 pb-8">
        <SkeletonTable rows={8} columns={4} />
      </div>
    );
  }

  if (detailQuery.isError || !audit) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <Text as="p" className="text4 text-ehs-red">
          Could not load this audit.
        </Text>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="mdi:format-list-checks"
        title="Nothing to audit"
        message="The template this audit was created from has no questions."
      />
    );
  }

  const blocked = new Set(blockedIds);
  const evidence = toChecklistEvidence(audit.attachments ?? []);

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <ChecklistHeader
        recordId={formatRecordDisplayId("A", audit.id)}
        title="Perform Audit"
        subtitle={audit.auditTitle || audit.snapshot?.templateName || ""}
        saveState={saveState}
        isLocked={isLocked}
        onViewFindings={() => {
          router.push(`/dashboard/audits/${encodeURIComponent(auditId)}`);
        }}
        onReopen={() => {
          setIsReopening(true);
        }}
      />

      <ChecklistTallyCard tally={tally} />

      {isLocked ? (
        <IncidentGlassCard paddingClassName="px-5 py-3" className="min-w-0">
          <Text as="p" className="text8 text-ehs-gray">
            {`This audit is ${audit.status.toLowerCase()} and can no longer be edited. Reopen it to make a correction.`}
          </Text>
        </IncidentGlassCard>
      ) : null}

      {sections.map((section) => (
        <IncidentGlassCard
          key={section.id}
          paddingClassName="p-0 overflow-hidden"
          className="min-w-0"
        >
          <header className="border-ehs-hairline/90 bg-ehs-form-classes-bg/70 border-b px-5 py-3">
            <Text as="h3" className="text3 text-ehs-darker">
              {section.title}
            </Text>
            {section.description ? (
              <Text as="p" className="text8 text-ehs-gray mt-0.5">
                {section.description}
              </Text>
            ) : null}
          </header>

          <ul className="flex flex-col">
            {section.items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                answer={answers[item.id]}
                attachments={evidenceForItem(evidence, item.id)}
                disabled={isLocked}
                isBlocked={blocked.has(item.id)}
                isUploading={uploadingItemId === item.id}
                onChange={(next) => {
                  handleAnswerChange(item.id, next);
                }}
                onAttach={(file) => {
                  handleAttach(item.id, file);
                }}
                onRemoveAttachment={handleRemoveAttachment}
              />
            ))}
          </ul>
        </IncidentGlassCard>
      ))}

      {isLocked ? null : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            isLoading={submitAudit.isPending}
            onClick={() => {
              void handleRequestSubmit();
            }}
          >
            Submit Audit
          </Button>

          <Text as="span" className="text8 text-ehs-gray">
            {tally.pending > 0
              ? `${String(tally.pending)} of ${String(tally.total)} still pending`
              : "Every question answered"}
          </Text>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmingSubmit}
        title="Submit this audit?"
        description={
          tally.action + tally.critical > 0
            ? `All ${String(tally.total)} questions are graded. Submitting locks the answers and raises ${String(tally.action + tally.critical)} finding(s) from the questions you graded Action or Critical.`
            : `All ${String(tally.total)} questions are graded and none needs action. Submitting locks the answers; only a lead can reopen the audit afterwards.`
        }
        confirmLabel="Submit"
        isConfirming={submitAudit.isPending}
        onConfirm={handleSubmit}
        onCancel={() => {
          setIsConfirmingSubmit(false);
        }}
      />

      {isReopening ? (
        <ReopenAuditDialog
          auditId={auditId}
          onClose={() => {
            setIsReopening(false);
          }}
          onReopened={() => {
            setIsReopening(false);
            // The run is editable again, so take its answers fresh from the server.
            hydratedForRef.current = null;
          }}
        />
      ) : null}
    </div>
  );
}
