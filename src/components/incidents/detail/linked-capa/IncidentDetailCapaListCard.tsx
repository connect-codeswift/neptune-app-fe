"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
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
              className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
            >
              Linked corrective & preventive actions
            </Text>
            <span className="text-[11px] leading-normal text-[#8892a3]">
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
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#0891a6] px-3 py-[7.5px] text-[12px] font-bold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition-colors hover:bg-[#067a8c] disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className="py-8 text-center text-[12px] text-[#8892a3]">
              Loading linked CAPAs…
            </div>
          ) : capas.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-[#8892a3]">
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
                    <span className="text-[11px] font-bold text-[#8892a3]">
                      {item.code}
                    </span>
                    <span className="inline-flex items-center gap-[5px] rounded-full bg-[rgba(11,19,32,0.14)] px-[9px] py-[3px] text-[10.5px] font-bold text-[#566072]">
                      <span className="size-1.5 rounded-[3px] bg-[#566072]" />
                      {item.controlCategory}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[rgba(86,96,114,0.14)] px-[9px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.2px] text-[#566072]">
                      {item.actionType}
                    </span>
                    <span
                      className={[
                        "ml-auto inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.2px] text-[#566072]",
                        item.status === "Planning"
                          ? "bg-[rgba(86,96,114,0.14)]"
                          : "bg-[rgba(11,19,32,0.14)]",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-[13.5px] leading-[19.58px] font-normal text-[#0b1320]">
                    {item.title}
                  </h4>

                  <div className="flex flex-col gap-2 pt-[3px] sm:flex-row sm:items-center sm:gap-[14px]">
                    <div className="flex shrink-0 items-center gap-[14px]">
                      <span className="inline-flex items-center gap-[5px] text-[11px] text-[#566072]">
                        <Icon
                          icon="mdi:account-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.assignee}
                      </span>
                      <span className="inline-flex items-center gap-[5px] text-[11px] text-[#566072]">
                        <Icon
                          icon="mdi:calendar-outline"
                          className="size-3"
                          aria-hidden="true"
                        />
                        {item.dueDate}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[rgba(136,146,163,0.2)]">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-[#10b981]" : "bg-[#0891a6]",
                          ].join(" ")}
                          style={{ width: `${String(item.progressPercent)}%` }}
                        />
                      </div>
                      <span className="min-w-[30px] shrink-0 text-right text-[11px] text-[#8892a3]">
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
