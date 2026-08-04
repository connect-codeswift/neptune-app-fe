"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  ContributingFactorItem,
  WhyChainItem,
} from "@/components/incidents/detail/incident-detail-types";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { toast } from "@/lib/toast";

export type { WhyChainItem, ContributingFactorItem };

export type IncidentDetailInvestigationCardProps = Readonly<{
  whyChain?: readonly WhyChainItem[];
  contributingFactors?: readonly ContributingFactorItem[];
  methodLine?: string;
  statusLabel?: "Not started" | "In progress" | "Complete";
  onOpenHrca?: () => void;
  className?: string;
}>;

export function IncidentDetailInvestigationCard(
  props: Readonly<IncidentDetailInvestigationCardProps>,
) {
  const {
    whyChain = [],
    contributingFactors = [],
    methodLine = "Method: 5 Whys · Linked to HRCA worksheet",
    statusLabel = "Not started",
    onOpenHrca,
    className = "",
  } = props;

  const handleOpenHrca =
    onOpenHrca ??
    (() => {
      toast.success(
        "HRCA Worksheet Opened",
        "Loading HRCA worksheet details...",
      );
    });

  const statusTone =
    statusLabel === "Complete"
      ? "bg-ehs-green-bg-light text-ehs-dark-blue"
      : statusLabel === "In progress"
        ? "bg-ehs-blue/14 text-ehs-blue"
        : "bg-ehs-dark-bg/10 text-ehs-gray";

  const statusDot =
    statusLabel === "Complete"
      ? "bg-ehs-green"
      : statusLabel === "In progress"
        ? "bg-ehs-blue"
        : "bg-ehs-muted-text";

  return (
    <div
      className={["flex flex-col gap-[14px]", className].filter(Boolean).join(" ")}
    >
      <IncidentGlassCard paddingClassName="p-[19px]">
        <div className="flex flex-wrap items-center gap-[14px]">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-ehs-dark-blue-bg-light text-ehs-dark-blue">
            <Icon
              icon="mdi:star-four-points"
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Text
              as="h3"
              className="text-sm leading-normal font-bold text-ehs-dark-bg"
            >
              5-Why root cause analysis
            </Text>
            <span className="text-sm leading-normal text-ehs-gray">
              {methodLine}
            </span>
          </div>

          <span
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-[9px] pt-[2.5px] pb-[2.89px] text-sm leading-normal font-bold tracking-wide",
              statusTone,
            ].join(" ")}
          >
            <span
              className={["size-1.5 shrink-0 rounded-[3px]", statusDot].join(
                " ",
              )}
            />
            {statusLabel}
          </span>

          <button
            type="button"
            onClick={handleOpenHrca}
            className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-ehs-normal-blue px-[15px] pt-[10px] pb-[10.5px] text-sm font-bold text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors hover:bg-ehs-normal-blue-active"
          >
            <Icon
              icon="mdi:open-in-new"
              className="size-[13px]"
              aria-hidden="true"
            />
            Open HRCA
          </button>
        </div>
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-[23px]"
        incidentGlassCardClassName="gap-[14px]"
        className="bg-white/62"
      >
        <div className="flex flex-col gap-0.5">
          <Text
            as="h3"
            className="text-ehs-dark-bg text-lg font-semibold"
          >
            Why-chain
          </Text>
          <span className="text-xs leading-normal text-ehs-muted-text">
            Drill from event to root cause
          </span>
        </div>

        {whyChain.length === 0 ? (
          <div className="py-8 text-center text-sm text-ehs-muted-text">
            No investigation findings recorded for this incident yet.
          </div>
        ) : (
          <div className="flex flex-col">
            {whyChain.map((item, index) => {
              const isRoot = Boolean(item.isRootCause);
              const isLast = index === whyChain.length - 1;

              return (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="flex flex-col items-center self-stretch">
                    <div
                      className={[
                        "flex size-7 shrink-0 items-center justify-center rounded-[14px] text-sm font-bold",
                        isRoot
                          ? "bg-ehs-normal-blue text-ehs-light-text"
                          : "border border-[rgba(15,23,42,0.14)] bg-[rgba(255,255,255,0.82)] text-ehs-gray",
                      ].join(" ")}
                    >
                      {item.step}
                    </div>
                    {!isLast ? (
                      <div className="min-h-[14px] w-0.5 flex-1 bg-[rgba(15,23,42,0.08)]" />
                    ) : null}
                  </div>

                  <div className={isLast ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-3"}>
                    <div
                      className={[
                        "flex flex-col gap-0.5 rounded-[10px] border px-[15px] py-[11px]",
                        isRoot
                          ? "border-ehs-normal-blue bg-ehs-dark-blue-bg-light"
                          : "border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-flex items-center gap-1 text-[9.5px] font-bold tracking-[0.76px] uppercase",
                          isRoot ? "text-ehs-dark-blue" : "text-ehs-muted-text",
                        ].join(" ")}
                      >
                        {isRoot ? (
                          <Icon
                            icon="mdi:target"
                            className="size-3"
                            aria-hidden="true"
                          />
                        ) : null}
                        {item.label}
                      </span>
                      <p
                        className={[
                          "text-sm leading-[18.85px]",
                          isRoot
                            ? "font-bold text-ehs-dark-bg"
                            : "font-normal text-ehs-dark-bg",
                        ].join(" ")}
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </IncidentGlassCard>

      {contributingFactors.length > 0 ? (
        <IncidentGlassCard
          paddingClassName="p-[23px]"
          incidentGlassCardClassName="gap-[14px]"
          className="bg-white/62"
        >
          <Text
            as="h3"
            className="text-ehs-dark-bg text-lg font-semibold"
          >
            Contributing factors
          </Text>

          <div className="flex flex-col gap-[10px]">
            {contributingFactors.map((factor) => (
              <div
                key={`${factor.category}-${factor.text}`}
                className="flex items-start gap-3 rounded-[10px] border border-[rgba(15,23,42,0.08)] border-l-[3px] bg-[rgba(255,255,255,0.62)] py-[13px] pr-[13px] pl-[15px]"
                style={{ borderLeftColor: factor.accent }}
              >
                <span
                  className="min-w-[86px] shrink-0 text-xs font-bold tracking-[0.6px] uppercase"
                  style={{ color: factor.accent }}
                >
                  {factor.category}
                </span>
                <span className="text-sm leading-[18.13px] text-ehs-slate">
                  {factor.text}
                </span>
              </div>
            ))}
          </div>
        </IncidentGlassCard>
      ) : null}
    </div>
  );
}
