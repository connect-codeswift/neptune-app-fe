"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";
import { AddCapaModal } from "@/components/incidents/list/capa/AddCapaModal";

export type CapaItem = Readonly<{
  id: string;
  code: string;
  controlCategory: string; // e.g. "Substitution", "Engineering Controls", "Administrative Controls"
  actionType: "Corrective" | "Preventive";
  status: "In progress" | "Planning" | "Verified" | "Closed";
  statusTone?: "blue" | "gray" | "green";
  title: string;
  assignee: string;
  dueDate: string;
  progressPercent: number;
}>;

export type IncidentDetailCapaListCardProps = Readonly<{
  capas?: readonly CapaItem[];
  onAddCapa?: () => void;
  incidentId?: string;
  incidentTitle?: string;
  className?: string;
}>;

const DEFAULT_CAPAS: readonly CapaItem[] = [
  {
    id: "capa-1",
    code: "CAPA-512",
    controlCategory: "Substitution",
    actionType: "Corrective",
    status: "In progress",
    statusTone: "gray",
    title:
      "Replace all 800-series press hoses with low-pressure hydraulic spec",
    assignee: "M. Torres",
    dueDate: "2026-05-08",
    progressPercent: 45,
  },
  {
    id: "capa-2",
    code: "CAPA-514",
    controlCategory: "Engineering Controls",
    actionType: "Preventive",
    status: "Planning",
    statusTone: "gray",
    title: "Install burst shielding + pressure-relief sensor with auto-shutoff",
    assignee: "D. Park",
    dueDate: "2026-06-04",
    progressPercent: 10,
  },
  {
    id: "capa-3",
    code: "CAPA-515",
    controlCategory: "Administrative Controls",
    actionType: "Corrective",
    status: "Verified",
    statusTone: "green",
    title: "Revise SOP-204 — condition-based hose inspection each shift",
    assignee: "S. Mitchell",
    dueDate: "2026-05-10",
    progressPercent: 100,
  },
];

export function IncidentDetailCapaListCard(
  props: Readonly<IncidentDetailCapaListCardProps>,
) {
  const {
    capas = DEFAULT_CAPAS,
    onAddCapa,
    incidentId = "INC-2025-DET-001",
    incidentTitle = "Hydraulic Press Hose Rupture & Fluid Release",
    className = "",
  } = props;

  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);

  const handleAdd = onAddCapa ?? (() => setIsAddCapaOpen(true));

  return (
    <>
      <IncidentGlassCard paddingClassName="p-4 sm:p-5" className={className}>
        {/* Header Bar */}
        <div className="mb-4 flex flex-col gap-3 border-b border-[rgba(15,23,42,0.06)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
              Linked corrective & preventive actions
            </Text>
            <span className="text-ehs-muted-text text-[11px]">
              {capas.length} linked to {incidentId}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 self-start rounded-[6px] bg-[#0891a6] px-3.5 py-1.5 text-[11.5px] font-bold text-white shadow-[0px_4px_12px_-4px_#0891a6] transition-colors hover:bg-[#067485] sm:self-auto"
          >
            <Icon icon="mdi:plus" className="size-4" />
            <span>Add CAPA</span>
          </button>
        </div>

        {/* CAPA Action Cards List */}
        <div className="flex flex-col gap-3.5">
          {capas.length === 0 ? (
            <div className="text-ehs-muted-text py-8 text-center text-[12px]">
              No linked CAPA actions found for this incident.
            </div>
          ) : (
            capas.map((item) => {
              const isCompleted = item.progressPercent === 100;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2.5 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/60 p-3.5 shadow-sm transition-all hover:border-[rgba(15,23,42,0.15)] sm:p-4"
                >
                  {/* Row 1: Code, Control Category Pill, Type Pill, Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-ehs-dark-bg text-[12px] font-bold">
                        {item.code}
                      </span>
                      <span className="text-ehs-dark-bg inline-flex items-center gap-1 rounded-full bg-[rgba(15,23,42,0.06)] px-2.5 py-0.5 text-[10px] font-semibold">
                        <span className="size-1.5 rounded-full bg-slate-500" />
                        {item.controlCategory}
                      </span>
                      <span className="text-ehs-gray rounded-full bg-[rgba(15,23,42,0.05)] px-2.5 py-0.5 text-[10px] font-semibold">
                        {item.actionType}
                      </span>
                    </div>

                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-0.5 rounded-[6px] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.2px]",
                        item.statusTone === "green" ||
                        item.status === "Verified"
                          ? "bg-[#10b981]/12 text-[#0f766e]"
                          : "text-ehs-gray bg-[rgba(15,23,42,0.07)]",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Row 2: Title */}
                  <h4 className="text-ehs-dark-bg text-[13px] leading-snug font-bold">
                    {item.title}
                  </h4>

                  {/* Row 3: Assignee, Due Date, Progress Bar */}
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-ehs-gray flex items-center gap-4 text-[11px] font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Icon icon="mdi:account-outline" className="size-3.5" />
                        {item.assignee}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon
                          icon="mdi:calendar-outline"
                          className="size-3.5"
                        />
                        {item.dueDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:w-[220px]">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                        <div
                          className={[
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-[#10b981]" : "bg-[#0891a6]",
                          ].join(" ")}
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-ehs-gray min-w-[32px] shrink-0 text-right text-[10.5px] font-bold">
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

      {/* Shared Add CAPA Modal Portal */}
      {isAddCapaOpen && (
        <AddCapaModal
          incidentId={incidentId}
          incidentTitle={incidentTitle}
          onClose={() => setIsAddCapaOpen(false)}
          onSubmit={(payload) => {
            toast.success(
              "CAPA Action Created",
              `Added new ${payload.type} action assigned to ${payload.owner}.`,
            );
            setIsAddCapaOpen(false);
          }}
        />
      )}
    </>
  );
}
