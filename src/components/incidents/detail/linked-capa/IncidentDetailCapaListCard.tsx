"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
import type { CapaFormPayload } from "@/components/incidents/shared/capa/AddCapaModal";
import type { CapaTaskFormPayload } from "@/components/incidents/shared/capa/AddTaskModal";
import { CapaCompletionReviewModal } from "@/components/incidents/shared/capa/CapaCompletionReviewModal";
import { SkeletonListRows } from "@/components/ui/skeletons";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import {
  capaNeedsManagerReview,
  capaTaskStatusBadgeClass,
  formatCapaTaskStatusLabel,
} from "@/services/mappers/capa.mapper";

export type { CapaItem };

export type IncidentDetailCapaListCardProps = Readonly<{
  capas: readonly CapaItem[];
  incidentId: string;
  incidentTitle: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  isVerifying?: boolean;
  /**
   * A finalised incident takes no new CAPAs — the backend refuses them outright — so
   * the card stops offering the action rather than surfacing a button that 400s.
   * Existing CAPAs stay fully interactive: completing and verifying them is exactly
   * what still has to happen after closure.
   */
  isIncidentClosed?: boolean;
  openAddModal?: boolean;
  onAddModalOpened?: () => void;
  onSubmitCapa?: (payload: CapaFormPayload) => void | Promise<void>;
  onUpdateCapa?: (
    capa: CapaItem,
    payload: CapaFormPayload,
  ) => void | Promise<void>;
  isCreatingCapaTask?: boolean;
  onCreateCapaTask?: (
    capa: CapaItem,
    payload: CapaTaskFormPayload,
  ) => void | Promise<void>;
  isDeletingCapaTask?: boolean;
  onDeleteCapaTask?: (capa: CapaItem, taskId: number) => void | Promise<void>;
  onVerifyCapa?: (
    capa: CapaItem,
    input: { effectiveness: CapaEffectiveness; notes: string },
  ) => void | Promise<void>;
  className?: string;
}>;

function reviewDismissKey(capaId: string) {
  return `capa-review-dismissed-${capaId}`;
}

export function IncidentDetailCapaListCard(
  props: Readonly<IncidentDetailCapaListCardProps>,
) {
  const {
    capas,
    incidentId,
    incidentTitle,
    isLoading = false,
    isSubmitting = false,
    isVerifying = false,
    isIncidentClosed = false,
    openAddModal = false,
    onAddModalOpened,
    onSubmitCapa,
    onUpdateCapa,
    isCreatingCapaTask = false,
    onCreateCapaTask,
    isDeletingCapaTask = false,
    onDeleteCapaTask,
    onVerifyCapa,
    className = "",
  } = props;

  const [addModalRequestedLocally, setAddModalRequestedLocally] =
    useState(false);
  const [editingCapa, setEditingCapa] = useState<CapaItem | null>(null);
  const [reviewCapa, setReviewCapa] = useState<CapaItem | null>(null);
  const autoPromptedRef = useRef<ReadonlySet<string>>(new Set());

  // Gated here rather than only on the button so a stale `openAddModal` request —
  // for instance a "add CAPA" deep link followed while the incident was being closed —
  // cannot pop the modal on a closed incident.
  const canAddCapa = !isIncidentClosed;
  const isAddCapaOpen =
    canAddCapa && (addModalRequestedLocally || openAddModal);

  const handleCloseAddModal = () => {
    setAddModalRequestedLocally(false);
    onAddModalOpened?.();
  };

  const openReview = (capa: CapaItem) => {
    setReviewCapa(capa);
  };

  const closeReview = () => {
    if (reviewCapa) {
      sessionStorage.setItem(reviewDismissKey(reviewCapa.id), "1");
    }
    setReviewCapa(null);
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const pendingReview = capas.find(
      (item) =>
        capaNeedsManagerReview(item) &&
        !autoPromptedRef.current.has(item.id) &&
        sessionStorage.getItem(reviewDismissKey(item.id)) !== "1",
    );

    if (pendingReview) {
      autoPromptedRef.current = new Set([
        ...autoPromptedRef.current,
        pendingReview.id,
      ]);
      setReviewCapa(pendingReview);
    }
  }, [capas, isLoading]);

  return (
    <>
      <IncidentGlassCard
        paddingClassName="p-5.75"
        incidentGlassCardClassName="gap-3.5"
        className={["bg-ehs-surface/62", className].filter(Boolean).join(" ")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="h3" className="text-ehs-dark-bg text3">
              Linked Corrective & Preventive Actions
            </Text>
            <span className="text-ehs-muted-text text4 leading-normal">
              {isLoading
                ? `Loading CAPAs for ${incidentId}…`
                : `${String(capas.length)} linked to ${incidentId} · review completed actions to verify and close`}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canAddCapa ? (
              <button
                type="button"
                onClick={() => setAddModalRequestedLocally(true)}
                disabled={isSubmitting}
                className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-active rounded-2.5 text5 inline-flex items-center gap-2 px-3 py-2 shadow-(--ehs-shadow-button-primary-flat) transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon
                  icon="mdi:plus"
                  className="size-3.25"
                  aria-hidden="true"
                />
                Add CAPA
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <SkeletonListRows rows={3} />
          ) : capas.length === 0 ? (
            <EmptyState
              variant="plain"
              icon="mdi:link-variant"
              title="No linked CAPA actions"
              message="Corrective actions raised from this incident appear here."
            />
          ) : (
            capas.map((item) => {
              const taskStatusLabel = formatCapaTaskStatusLabel(
                item.taskStatus,
              );
              const isCompleted = item.taskStatus === "Completed";
              const needsReview = capaNeedsManagerReview(item);
              const isVerified =
                item.status === "Verified" || item.status === "Closed";
              const hasLinkedTask = item.primaryTaskId != null;

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-3 bg-ehs-surface/82 flex flex-col gap-1.75 border p-4.25",
                    needsReview
                      ? "border-ehs-green/30 ring-ehs-green/20 ring-1"
                      : "border-ehs-border-ink/8",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="text-ehs-muted-text text5">
                      {item.code}
                    </span>
                    <span className="bg-ehs-surface-inverse/14 text-ehs-gray text7 inline-flex items-center gap-1.25 rounded-full px-2.25 py-0.75">
                      <span className="bg-ehs-gray rounded-0.75 size-1.5" />
                      {item.controlCategory}
                    </span>
                    <span className="bg-ehs-gray/14 text-ehs-gray text7 inline-flex items-center rounded-full px-2.25 py-0.75 leading-3.5">
                      {item.actionType}
                    </span>

                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                      {needsReview ? (
                        <button
                          type="button"
                          onClick={() => openReview(item)}
                          className="bg-ehs-green/14 text-ehs-green hover:bg-ehs-green/20 text7 inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors"
                        >
                          <Icon
                            icon="mdi:eye-check-outline"
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Review
                        </button>
                      ) : null}
                      <span
                        className={[
                          "text7 inline-flex items-center rounded-full px-2.25 py-0.75 leading-3.5",
                          isVerified
                            ? "bg-ehs-green/14 text-ehs-green"
                            : capaTaskStatusBadgeClass(item.taskStatus),
                        ].join(" ")}
                        title={
                          isVerified
                            ? "Verified and closed by manager"
                            : hasLinkedTask
                              ? "Status set by the assignee"
                              : "Action task not created yet"
                        }
                      >
                        {isVerified ? "Verified" : taskStatusLabel}
                      </span>
                      <button
                        type="button"
                        aria-label={`Edit ${item.code}`}
                        disabled={isSubmitting}
                        onClick={() => setEditingCapa(item)}
                        className="text-ehs-muted-text hover:text-ehs-normal-blue inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Icon
                          icon="mdi:pencil-outline"
                          className="size-4"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-ehs-dark-bg text4 leading-[19.58px] font-normal">
                    {item.title}
                  </h4>

                  <div className="flex flex-col gap-2 pt-0.75 sm:flex-row sm:items-center sm:gap-3.5">
                    <div className="flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-1">
                      <span className="text-ehs-gray text4 inline-flex items-center gap-1.25">
                        <Icon
                          icon="mdi:account-arrow-right-outline"
                          className="size-3.5"
                          aria-hidden="true"
                        />
                        <span>
                          Assigned to{" "}
                          <span className="text-ehs-dark-bg font-medium">
                            {item.assignee}
                          </span>
                        </span>
                      </span>
                      <span className="text-ehs-gray text4 inline-flex items-center gap-1.25">
                        <Icon
                          icon="mdi:calendar-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        Due {item.dueDate}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!isCompleted && !isVerified}
                      onClick={() => {
                        if (isCompleted || isVerified) {
                          openReview(item);
                        }
                      }}
                      className={[
                        "flex min-w-0 flex-1 items-center gap-2 text-left",
                        isCompleted || isVerified
                          ? "cursor-pointer rounded-lg transition-colors hover:opacity-90"
                          : "cursor-default",
                      ].join(" ")}
                      title={
                        isCompleted
                          ? "Assignee marked complete — click to review and verify"
                          : isVerified
                            ? "View verification record"
                            : "Progress updates when the assignee works this CAPA"
                      }
                    >
                      <div className="bg-ehs-muted-text/20 relative h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            isCompleted || isVerified
                              ? "bg-ehs-green"
                              : "bg-ehs-normal-blue",
                          ].join(" ")}
                          style={{ width: `${String(item.progressPercent)}%` }}
                        />
                      </div>
                      <span className="text-ehs-muted-text text8 sm:text4 min-w-18 shrink-0 text-right">
                        {isVerified ? "Verified" : taskStatusLabel} ·{" "}
                        {item.progressPercent}%
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </IncidentGlassCard>

      {isAddCapaOpen ? (
        <AddCapaModal
          key="add-capa"
          sourceLabel={incidentId}
          sourceTitle={incidentTitle}
          isSubmitting={isSubmitting}
          onClose={handleCloseAddModal}
          onSubmit={onSubmitCapa}
        />
      ) : null}

      {editingCapa ? (
        <AddCapaModal
          key={`edit-capa-${editingCapa.id}`}
          sourceLabel={incidentId}
          sourceTitle={incidentTitle}
          capaToEdit={editingCapa}
          isSubmitting={isSubmitting}
          isCreatingTask={isCreatingCapaTask}
          isDeletingTask={isDeletingCapaTask}
          onClose={() => setEditingCapa(null)}
          onSubmit={(payload) => onUpdateCapa?.(editingCapa, payload)}
          onCreateTask={(payload) => onCreateCapaTask?.(editingCapa, payload)}
          onDeleteTask={(taskId) => onDeleteCapaTask?.(editingCapa, taskId)}
        />
      ) : null}

      {reviewCapa ? (
        <CapaCompletionReviewModal
          key={`review-capa-${reviewCapa.id}`}
          capa={reviewCapa}
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          isSubmitting={isVerifying}
          onClose={closeReview}
          onVerify={(input) => onVerifyCapa?.(reviewCapa, input)}
        />
      ) : null}
    </>
  );
}
