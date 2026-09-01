"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  useDeleteIncidentDraftMutation,
  useIncidentDraftsQuery,
} from "@/hooks/use-incident-draft-queries";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { toast } from "@/lib/toast";

const STEP_NAMES = [
  "What happened",
  "Details",
  "People & injury",
  "Immediate response",
  "Review & submit",
] as const;

function stepLabel(step: number): string {
  const name = STEP_NAMES[step - 1];
  return name
    ? `Step ${String(step)} of 5 · ${name}`
    : `Step ${String(step)} of 5`;
}

/**
 * The reporter's own unfinished reports.
 *
 * <p>Deliberately its own page rather than rows in the incident list. A draft is
 * not an incident: it has not been reviewed, it may be wrong, and putting one in
 * the list would mean every stage filter, export and KPI had to remember to
 * exclude it. Nobody else can see these, so there is no assignee, no site column
 * and nothing to filter.</p>
 */
export function IncidentDraftsContent() {
  const draftsQuery = useIncidentDraftsQuery();
  const deleteDraft = useDeleteIncidentDraftMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = async (draftId: string) => {
    try {
      await deleteDraft.mutateAsync(draftId);
      toast.success(
        "Draft deleted",
        "That unfinished report has been removed.",
      );
    } catch {
      toast.error("Could not delete that draft", "Please try again.");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-4 px-3 py-6 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Text
            as="h1"
            className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
          >
            Drafts
          </Text>
          <Text as="p" className="text-ehs-muted-text text-sm">
            Unfinished reports, visible only to you. They become incidents when
            you submit them.
          </Text>
        </div>

        <Link href="/dashboard/incidents/report">
          <Button
            type="button"
            variant="primary"
            className="rounded-2.5 px-3.75 py-2.5 text-sm font-bold"
          >
            New report
          </Button>
        </Link>
      </div>

      {draftsQuery.isPending ? (
        <Text as="p" className="text-ehs-muted-text text-sm">
          Loading your drafts…
        </Text>
      ) : draftsQuery.isError ? (
        <Text as="p" className="text-ehs-red text-sm">
          Your drafts could not be loaded. Please refresh.
        </Text>
      ) : draftsQuery.data.length === 0 ? (
        <IncidentGlassCard>
          <Text as="p" className="text-ehs-dark-bg text-sm font-bold">
            No drafts saved.
          </Text>
          <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
            Choosing &quot;Save &amp; exit&quot; while writing a report keeps it
            here until you come back to it.
          </Text>
        </IncidentGlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          {draftsQuery.data.map((draft) => (
            <IncidentGlassCard key={draft.id} paddingClassName="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Text
                    as="p"
                    className={
                      draft.title
                        ? "text-ehs-dark-bg text-sm font-bold"
                        : "text-ehs-muted-text text-sm italic"
                    }
                  >
                    {/* An untitled draft is normal: the title lives on step 1 and
                        a reporter can save before reaching it. */}
                    {draft.title ?? "Untitled report"}
                  </Text>
                  <Text as="p" className="text-ehs-muted-text text-xs">
                    {`${stepLabel(draft.currentStep)} · Saved ${formatShortDateTime(
                      draft.updatedAt ? new Date(draft.updatedAt) : null,
                    )}`}
                  </Text>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/dashboard/incidents/report?draft=${encodeURIComponent(draft.id)}`}
                  >
                    <Button
                      type="button"
                      variant="primary"
                      className="rounded-2.5 px-3.5 py-2 text-sm font-bold"
                    >
                      Resume
                    </Button>
                  </Link>

                  {pendingDeleteId === draft.id ? (
                    <div className="flex items-center gap-2">
                      <Text as="span" className="text-ehs-muted-text text-xs">
                        Delete this draft?
                      </Text>
                      <Button
                        type="button"
                        variant="tertiary"
                        disabled={deleteDraft.isPending}
                        onClick={() => void handleDelete(draft.id)}
                        className="text-ehs-red rounded-2.5 px-3 py-2 text-sm font-bold"
                      >
                        {deleteDraft.isPending ? "Deleting…" : "Yes, delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="tertiary"
                        onClick={() => setPendingDeleteId(null)}
                        className="rounded-2.5 px-3 py-2 text-sm font-bold"
                      >
                        Keep
                      </Button>
                    </div>
                  ) : (
                    // Confirmed rather than immediate: this is the only copy of
                    // work someone has already chosen to keep once.
                    //
                    // Labelled, not icon-only. An icon alone rendered as a blank
                    // pill here, and a control that destroys the only copy of
                    // someone's work is the last one that should be guessable.
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => setPendingDeleteId(draft.id)}
                      className="text-ehs-muted-text rounded-2.5 flex items-center gap-1.5 px-3 py-2 text-sm font-bold"
                    >
                      <Icon
                        icon="mdi:trash-can-outline"
                        className="size-4"
                        aria-hidden="true"
                      />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </IncidentGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
