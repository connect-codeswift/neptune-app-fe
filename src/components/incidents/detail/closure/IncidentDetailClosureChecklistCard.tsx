"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/incidents/list/IncidentBadge";
import type { IncidentClosureData } from "@/components/incidents/detail/incident-detail-types";

export type IncidentDetailClosureChecklistCardProps = Readonly<{
  data: IncidentClosureData;
  onToggleCheckItem?: (itemId: string) => void;
  onFinalizeClosure?: () => void;
  isSubmitting?: boolean;
}>;

function residualRiskTone(
  risk: IncidentClosureData["residualRisk"],
): IncidentBadgeTone {
  switch (risk) {
    case "Low":
      return "teal";
    case "Medium":
      return "warn";
    case "High":
      return "danger";
  }
}

export function IncidentDetailClosureChecklistCard(
  props: Readonly<IncidentDetailClosureChecklistCardProps>,
) {
  const {
    data,
    onToggleCheckItem,
    onFinalizeClosure,
    isSubmitting = false,
  } = props;

  const completedCount = data.verificationChecklist.filter(
    (item) => item.completed,
  ).length;
  const totalCount = data.verificationChecklist.length;
  const isAllRequiredCompleted = data.verificationChecklist
    .filter((item) => item.required)
    .every((item) => item.completed);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Readiness Checklist Card */}
      <IncidentGlassCard
        paddingClassName="p-[21px]"
        incidentGlassCardClassName="gap-3.5"
      >
        <div className="flex items-center justify-between">
          <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
            Closure Checklist
          </Text>
          <span className="bg-ehs-normal-blue/10 text-ehs-normal-blue rounded-full px-2.5 py-0.5 text-sm font-bold">
            {completedCount}/{totalCount} Completed
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.verificationChecklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleCheckItem?.(item.id)}
              className={[
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                item.completed
                  ? "border-ehs-normal-blue/20 bg-ehs-normal-blue/5"
                  : "border-[rgba(15,23,42,0.08)] bg-white/70 hover:bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  item.completed
                    ? "border-ehs-normal-blue bg-ehs-normal-blue text-ehs-light-text"
                    : "border-[rgba(15,23,42,0.25)] bg-white",
                ].join(" ")}
              >
                {item.completed ? (
                  <Icon icon="mdi:check" className="size-3.5 stroke-[3]" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <Text
                    as="span"
                    className={[
                      "text-sm font-semibold",
                      item.completed
                        ? "text-ehs-dark-bg line-through opacity-80"
                        : "text-ehs-dark-bg",
                    ].join(" ")}
                  >
                    {item.label}
                  </Text>
                  {item.required ? (
                    <span className="text-ehs-red text-xs font-bold uppercase">
                      Required
                    </span>
                  ) : null}
                </div>
                {item.completedAt ? (
                  <span className="text-ehs-gray text-sm">
                    Verified: {item.completedAt}{" "}
                    {item.completedBy ? `by ${item.completedBy}` : ""}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </IncidentGlassCard>

      {/* Residual Risk Rating Card */}
      <IncidentGlassCard
        paddingClassName="p-[21px]"
        incidentGlassCardClassName="gap-[10px]"
      >
        <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
          Residual Risk Evaluation
        </Text>
        <div className="flex items-center justify-between rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-3.5">
          <div className="flex items-center gap-2.5">
            <Icon
              icon="mdi:shield-check-outline"
              className="text-ehs-normal-blue size-5"
            />
            <Text as="span" className="text-ehs-slate text-sm font-medium">
              Post-mitigation Risk Level:
            </Text>
          </div>
          <IncidentBadge
            label={data.residualRisk}
            tone={residualRiskTone(data.residualRisk)}
            showDot
          />
        </div>
      </IncidentGlassCard>

      {/* Approver Sign-off & Final Action Card */}
      <IncidentGlassCard
        paddingClassName="p-[21px]"
        incidentGlassCardClassName="gap-3.5"
      >
        <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
          Closure Approval & Sign-off
        </Text>

        <div className="flex items-center justify-between rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/70 p-3">
          <div className="flex items-center gap-3">
            <div className="bg-ehs-normal-blue/15 text-ehs-dark-blue flex size-9 items-center justify-center rounded-full font-bold">
              {data.approverInitials}
            </div>
            <div>
              <Text as="p" className="text-ehs-dark-bg text-sm font-bold">
                {data.approverName}
              </Text>
              <Text as="p" className="text-ehs-gray text-sm">
                {data.approverRole}
              </Text>
            </div>
          </div>
          <IncidentBadge
            label={data.isApproved ? "Approved" : "Pending Sign-off"}
            tone={data.isApproved ? "teal" : "neutral"}
          />
        </div>

        <button
          type="button"
          onClick={onFinalizeClosure}
          disabled={
            !isAllRequiredCompleted ||
            isSubmitting ||
            data.closureStatus === "Closed"
          }
          className={[
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all",
            data.closureStatus === "Closed"
              ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
              : isAllRequiredCompleted
                ? "bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active cursor-pointer shadow-[var(--ehs-normal-blue)]/20"
                : "bg-ehs-normal-blue/40 text-ehs-light-text cursor-not-allowed",
          ].join(" ")}
        >
          <Icon
            icon={
              data.closureStatus === "Closed"
                ? "mdi:check-circle"
                : "mdi:lock-check-outline"
            }
            className="size-4.5"
          />
          <span>
            {data.closureStatus === "Closed"
              ? "Incident Officially Closed"
              : isSubmitting
                ? "Finalizing Closure…"
                : "Finalize & Close Incident"}
          </span>
        </button>
      </IncidentGlassCard>
    </div>
  );
}
