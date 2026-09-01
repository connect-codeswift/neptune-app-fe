"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { Icon } from "@iconify/react";
import { Can } from "@/components/auth/Can";
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
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onOpenHrca?: () => void;
  /**
   * A closed incident cannot start an investigation — the RCA endpoints refuse
   * every write against it. One already on record stays open for reading.
   */
  isIncidentClosed?: boolean;
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
    isLoading = false,
    errorMessage = null,
    onRetry,
    onOpenHrca,
    isIncidentClosed = false,
    className = "",
  } = props;

  // Nothing documented means there is nothing to view, and a closed incident
  // cannot document anything now — so the worksheet has no reason to open.
  const hasRecordedRca = whyChain.length > 0 || contributingFactors.length > 0;
  const canOpenHrca = !isIncidentClosed || hasRecordedRca;

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
        : "bg-ehs-surface-inverse/10 text-ehs-gray";

  const statusDot =
    statusLabel === "Complete"
      ? "bg-ehs-green"
      : statusLabel === "In progress"
        ? "bg-ehs-blue"
        : "bg-ehs-muted-text";

  return (
    <div
      className={["flex flex-col gap-3.5", className].filter(Boolean).join(" ")}
    >
      <IncidentGlassCard paddingClassName="p-4.75">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="bg-ehs-dark-blue-bg-light text-ehs-dark-blue rounded-3 flex size-11 shrink-0 items-center justify-center">
            <Icon
              icon="mdi:star-four-points"
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Text
              as="h3"
              className="text-ehs-dark-bg text4 leading-normal font-bold"
            >
              5-Why root cause analysis
            </Text>
            <span className="text-ehs-gray text4 leading-normal">
              {methodLine}
            </span>
          </div>

          <span
            className={[
              "text4 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.25 pt-[3px] pb-[3px] leading-normal font-bold tracking-wide",
              statusTone,
            ].join(" ")}
          >
            <span
              className={["rounded-0.75 size-1.5 shrink-0", statusDot].join(
                " ",
              )}
            />
            {statusLabel}
          </span>

          {canOpenHrca ? (
            // The worksheet reads GET /incidents/{id}/rca, which checks Rca.View.
            <Can do="Rca.View">
              <button
                type="button"
                onClick={handleOpenHrca}
                className="bg-ehs-normal-blue text-ehs-on-accent hover:bg-ehs-normal-blue-active rounded-2.5 text5 inline-flex shrink-0 items-center gap-2 px-3.75 pt-2.5 pb-[11px] shadow-(--ehs-shadow-button-primary-flat) transition-colors"
              >
                <Icon
                  icon="mdi:open-in-new"
                  className="size-3.25"
                  aria-hidden="true"
                />
                {isIncidentClosed ? "View RCA" : "Open RCA"}
              </button>
            </Can>
          ) : (
            <span className="text-ehs-muted-text text5 border-ehs-border-ink/8 bg-ehs-surface/62 rounded-2.5 inline-flex shrink-0 items-center gap-2 border px-3.75 pt-2.5 pb-[11px]">
              <Icon icon="mdi:lock" className="size-3.25" aria-hidden="true" />
              Closed — no investigation
            </span>
          )}
        </div>
      </IncidentGlassCard>

      <IncidentGlassCard
        paddingClassName="p-5.75"
        incidentGlassCardClassName="gap-3.5"
        className="bg-ehs-surface/62"
      >
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text3">
            Why-chain
          </Text>
          <span className="text-ehs-muted-text text8 leading-normal">
            Drill from event to root cause
          </span>
        </div>

        {isLoading ? (
          <div className="text-ehs-muted-text text4 py-8 text-center">
            Loading RCA analysis…
          </div>
        ) : errorMessage ? (
          <div className="text4 flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-ehs-red">{errorMessage}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="text-ehs-normal-blue font-semibold hover:underline"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : whyChain.length === 0 ? (
          <EmptyState
            variant="plain"
            icon="mdi:sitemap-outline"
            title={
              isIncidentClosed
                ? "No root cause analysis recorded"
                : "No root cause analysis yet"
            }
            message={
              isIncidentClosed
                ? "This incident was closed without one, and a closed incident can no longer be investigated."
                : "Open RCA to document contributing factors, whys, and corrective actions."
            }
          />
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
                        "rounded-3.5 text5 flex size-7 shrink-0 items-center justify-center",
                        isRoot
                          ? "bg-ehs-normal-blue text-ehs-on-accent"
                          : "text-ehs-gray border-ehs-border-strong bg-ehs-surface/82 border",
                      ].join(" ")}
                    >
                      {item.step}
                    </div>
                    {!isLast ? (
                      <div className="bg-ehs-surface-inverse/8 min-h-3.5 w-0.5 flex-1" />
                    ) : null}
                  </div>

                  <div
                    className={
                      isLast ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-3"
                    }
                  >
                    <div
                      className={[
                        "rounded-2.5 flex flex-col gap-0.5 border px-3.75 py-2.75",
                        isRoot
                          ? "border-ehs-normal-blue bg-ehs-dark-blue-bg-light"
                          : "border-ehs-border-ink/8 bg-ehs-surface/62",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "text8 inline-flex items-center gap-1 font-bold tracking-[0.76px] uppercase",
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
                          "text4 leading-[18.85px]",
                          isRoot
                            ? "text-ehs-dark-bg font-bold"
                            : "text-ehs-dark-bg font-normal",
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
          paddingClassName="p-5.75"
          incidentGlassCardClassName="gap-3.5"
          className="bg-ehs-surface/62"
        >
          <Text as="h3" className="text-ehs-dark-bg text3">
            Contributing factors
          </Text>

          <div className="flex flex-col gap-2.5">
            {contributingFactors.map((factor) => (
              <div
                key={`${factor.category}-${factor.text}`}
                className="rounded-2.5 border-l-0.75 border-ehs-border-ink/8 bg-ehs-surface/62 flex items-start gap-3 border py-3.25 pr-3.25 pl-3.75"
                style={{ borderLeftColor: factor.accent }}
              >
                <span
                  className="text7 min-w-21.5 shrink-0 tracking-[0.6px] uppercase"
                  style={{ color: factor.accent }}
                >
                  {factor.category}
                </span>
                <span className="text-ehs-slate text4 leading-[18.13px]">
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
