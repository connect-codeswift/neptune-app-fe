"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
import { SkeletonListRows } from "@/components/ui/skeletons";
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";

export type { CapaItem };

export type IncidentDetailCapaListCardProps = Readonly<{
  capas: readonly CapaItem[];
  incidentId: string;
  incidentTitle: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSubmitCapa?: (payload: {
    controlLevel: string;
    description: string;
    type: string;
    owner: string;
    dueDate: string;
    priority: string;
  }) => void | Promise<void>;
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
    onSubmitCapa,
    className = "",
  } = props;

  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);

  return (
    <>
      <IncidentGlassCard
        paddingClassName="p-[23px]"
        incidentGlassCardClassName="gap-[14px]"
        className={["bg-white/62", className].filter(Boolean).join(" ")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text
              as="h3"
              className="text-ehs-dark-bg text-lg font-semibold"
            >
              Linked corrective & preventive actions
            </Text>
            <span className="text-sm leading-normal text-ehs-muted-text">
              {isLoading
                ? `Loading CAPAs for ${incidentId}…`
                : `${String(capas.length)} linked to ${incidentId}`}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddCapaOpen(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-[10px] bg-ehs-normal-blue px-3 py-[7.5px] text-sm font-bold text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors hover:bg-ehs-normal-blue-active disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="py-8 text-center text-sm text-ehs-muted-text">
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
                    <span className="text-sm font-bold text-ehs-muted-text">
                      {item.code}
                    </span>
                    <span className="inline-flex items-center gap-[5px] rounded-full bg-ehs-dark-bg/14 px-[9px] py-[3px] text-xs font-bold text-ehs-gray">
                      <span className="size-1.5 rounded-[3px] bg-ehs-gray" />
                      {item.controlCategory}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-ehs-gray/14 px-[9px] py-[3px] text-xs leading-[14px] font-bold tracking-[0.2px] text-ehs-gray">
                      {item.actionType}
                    </span>
                    <span
                      className={[
                        "ml-auto inline-flex items-center rounded-full px-[9px] py-[3px] text-xs leading-[14px] font-bold tracking-[0.2px] text-ehs-gray",
                        item.status === "Planning"
                          ? "bg-ehs-gray/14"
                          : "bg-ehs-dark-bg/14",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-sm leading-[19.58px] font-normal text-ehs-dark-bg">
                    {item.title}
                  </h4>

                  <div className="flex flex-col gap-2 pt-[3px] sm:flex-row sm:items-center sm:gap-[14px]">
                    <div className="flex shrink-0 items-center gap-[14px]">
                      <span className="inline-flex items-center gap-[5px] text-sm text-ehs-gray">
                        <Icon
                          icon="mdi:account-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.assignee}
                      </span>
                      <span className="inline-flex items-center gap-[5px] text-sm text-ehs-gray">
                        <Icon
                          icon="mdi:calendar-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.dueDate}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ehs-muted-text/20">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-ehs-green" : "bg-ehs-normal-blue",
                          ].join(" ")}
                          style={{ width: `${String(item.progressPercent)}%` }}
                        />
                      </div>
                      <span className="min-w-[30px] shrink-0 text-right text-sm text-ehs-muted-text">
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
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          isSubmitting={isSubmitting}
          onClose={() => setIsAddCapaOpen(false)}
          onSubmit={onSubmitCapa}
        />
      ) : null}
    </>
  );
}
