"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
import type { CapaFormPayload } from "@/components/incidents/shared/capa/AddCapaModal";
import { SkeletonListRows } from "@/components/ui/skeletons";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";

export type { CapaItem };

export type IncidentDetailCapaListCardProps = Readonly<{
  capas: readonly CapaItem[];
  incidentId: string;
  incidentTitle: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  openAddModal?: boolean;
  onAddModalOpened?: () => void;
  onSubmitCapa?: (payload: CapaFormPayload) => void | Promise<void>;
  onUpdateCapa?: (
    capa: CapaItem,
    payload: CapaFormPayload,
  ) => void | Promise<void>;
  className?: string;
}>;

export function IncidentDetailCapaListCard(
  props: Readonly<IncidentDetailCapaListCardProps>,
) {
  const {
    capas,
    incidentId,
    incidentTitle,
    isLoading = false,
    isSubmitting = false,
    openAddModal = false,
    onAddModalOpened,
    onSubmitCapa,
    onUpdateCapa,
    className = "",
  } = props;

  const [addModalRequestedLocally, setAddModalRequestedLocally] =
    useState(false);
  const [editingCapa, setEditingCapa] = useState<CapaItem | null>(null);

  // Derive from prop + local click — avoids setState inside useEffect (eslint cascade rule).
  const isAddCapaOpen = addModalRequestedLocally || openAddModal;

  const handleCloseAddModal = () => {
    setAddModalRequestedLocally(false);
    onAddModalOpened?.();
  };

  return (
    <>
      <IncidentGlassCard
        paddingClassName="p-[23px]"
        incidentGlassCardClassName="gap-[14px]"
        className={["bg-white/62", className].filter(Boolean).join(" ")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
              Linked Corrective & Preventive Actions
            </Text>
            <span className="text-ehs-muted-text text-sm leading-normal">
              {isLoading
                ? `Loading CAPAs for ${incidentId}…`
                : `${String(capas.length)} linked to ${incidentId}`}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setAddModalRequestedLocally(true)}
              disabled={isSubmitting}
              className="bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active inline-flex items-center gap-2 rounded-[10px] px-3 py-[7.5px] text-sm font-bold shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon
                icon="mdi:plus"
                className="size-[13px]"
                aria-hidden="true"
              />
              Add CAPA
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <SkeletonListRows rows={3} />
          ) : capas.length === 0 ? (
            <div className="text-ehs-muted-text py-8 text-center text-sm">
              No linked CAPA actions found for this incident.
            </div>
          ) : (
            capas.map((item) => {
              const isCompleted =
                item.progressPercent === 100 || item.status === "Verified";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-[7px] rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] p-[17px]"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="text-ehs-muted-text text-sm font-bold">
                      {item.code}
                    </span>
                    <span className="bg-ehs-dark-bg/14 text-ehs-gray inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-xs font-bold">
                      <span className="bg-ehs-gray size-1.5 rounded-[3px]" />
                      {item.controlCategory}
                    </span>
                    <span className="bg-ehs-gray/14 text-ehs-gray inline-flex items-center rounded-full px-[9px] py-[3px] text-xs leading-[14px] font-bold tracking-[0.2px]">
                      {item.actionType}
                    </span>
                    <span
                      className={[
                        "text-ehs-gray ml-auto inline-flex items-center rounded-full px-[9px] py-[3px] text-xs leading-[14px] font-bold tracking-[0.2px]",
                        item.status === "Planning"
                          ? "bg-ehs-gray/14"
                          : "bg-ehs-dark-bg/14",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                    <button
                      type="button"
                      aria-label={`Edit ${item.code}`}
                      disabled={isSubmitting}
                      onClick={() => setEditingCapa(item)}
                      className="text-ehs-muted-text hover:text-ehs-normal-blue ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon
                        icon="mdi:pencil-outline"
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <h4 className="text-ehs-dark-bg text-sm leading-[19.58px] font-normal">
                    {item.title}
                  </h4>

                  <div className="flex flex-col gap-2 pt-[3px] sm:flex-row sm:items-center sm:gap-[14px]">
                    <div className="flex shrink-0 items-center gap-[14px]">
                      <span className="text-ehs-gray inline-flex items-center gap-[5px] text-sm">
                        <Icon
                          icon="mdi:account-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.assignee}
                      </span>
                      <span className="text-ehs-gray inline-flex items-center gap-[5px] text-sm">
                        <Icon
                          icon="mdi:calendar-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.dueDate}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="bg-ehs-muted-text/20 relative h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-ehs-green" : "bg-ehs-normal-blue",
                          ].join(" ")}
                          style={{ width: `${String(item.progressPercent)}%` }}
                        />
                      </div>
                      <span className="text-ehs-muted-text min-w-[30px] shrink-0 text-right text-sm">
                        {item.progressPercent}%
                      </span>
                    </div>
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
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          isSubmitting={isSubmitting}
          onClose={handleCloseAddModal}
          onSubmit={onSubmitCapa}
        />
      ) : null}

      {editingCapa ? (
        <AddCapaModal
          key={`edit-capa-${editingCapa.id}`}
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          capaToEdit={editingCapa}
          isSubmitting={isSubmitting}
          onClose={() => setEditingCapa(null)}
          onSubmit={(payload) => onUpdateCapa?.(editingCapa, payload)}
        />
      ) : null}
    </>
  );
}
