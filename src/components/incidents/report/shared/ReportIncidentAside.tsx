"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  SITE_STATS,
  STEP_TIPS,
  type ReportStepId,
} from "@/forms/incident-module/index";

export type ReportIncidentAsideProps = Readonly<{
  severityBadge: string;
  location: string;
  title?: string;
  description?: string;
  currentStep?: ReportStepId;
  className?: string;
}>;

export function ReportIncidentAside(props: Readonly<ReportIncidentAsideProps>) {
  const {
    severityBadge,
    location,
    title = "",
    description = "",
    currentStep = 1,
    className = "",
  } = props;

  const locationPreview = location.trim() || "Plant / location…";
  const hasLocation = location.trim().length > 0;
  const hasTitle = title.trim().length > 0;
  const hasDescription = description.trim().length > 0;
  const tip = STEP_TIPS[currentStep];

  return (
    <aside
      className={[
        "flex w-full flex-col gap-3.5 xl:sticky xl:top-0 xl:w-80 xl:shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <IncidentGlassCard paddingClassName="p-4.25" className="gap-0">
        <Text
          as="p"
          className="text-ehs-muted-text text-xs font-bold tracking-[1.05px] uppercase"
        >
          Live preview
        </Text>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-1">
          <Text as="span" className="text-ehs-muted-text text-xs font-bold">
            INC-DRAFT
          </Text>
          <span className="bg-ehs-surface-inverse/14 inline-flex items-center gap-1.5 rounded-full px-2.25 py-[3px]">
            <span className="bg-ehs-gray rounded-0.75 size-1.5" />
            <Text
              as="span"
              className="text-ehs-gray text-xs font-bold tracking-wide"
            >
              {severityBadge}
            </Text>
          </span>
        </div>

        <p
          className={[
            "mt-1 min-h-9.5 pt-0.5 pb-5 text-sm leading-4.5",
            hasTitle
              ? "text-ehs-dark-bg font-bold not-italic"
              : "text-ehs-muted-text italic",
          ].join(" ")}
        >
          {hasTitle ? title : "Title appears here…"}
        </p>

        <Text
          as="p"
          className={[
            "pb-1.75 text-sm leading-normal",
            hasLocation
              ? "text-ehs-muted-text not-italic"
              : "text-ehs-muted-text italic",
          ].join(" ")}
        >
          {locationPreview}
        </Text>

        <div className="bg-ehs-surface-inverse/8 h-px w-full" />

        <p
          className={[
            "max-h-17.5 overflow-hidden pt-1.5 text-sm leading-4.25",
            hasDescription
              ? "text-ehs-gray not-italic"
              : "text-ehs-muted-text italic",
          ].join(" ")}
        >
          {hasDescription ? description : "Description preview…"}
        </p>
      </IncidentGlassCard>

      <IncidentGlassCard paddingClassName="p-4.25">
        <Text
          as="p"
          className="text-ehs-muted-text mb-2.5 text-xs font-bold tracking-[1.05px] uppercase"
        >
          At this site
        </Text>
        <div className="flex flex-col gap-2.5">
          {SITE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-3"
            >
              <Text as="span" className="text-ehs-gray text-sm">
                {stat.label}
              </Text>
              <Text as="span" className="text-ehs-dark-bg text-sm font-bold">
                {stat.value}
              </Text>
            </div>
          ))}
        </div>
      </IncidentGlassCard>

      <div className="rounded-5 border-ehs-normal-blue/30 bg-ehs-dark-blue-bg-light backdrop-blur-2.5 before:rounded-5 relative flex flex-col gap-1.75 border p-4.25 shadow-(--ehs-shadow-card) before:pointer-events-none before:absolute before:inset-0 before:content-['']">
        <div className="relative z-1 flex items-center gap-1.5">
          <Icon
            icon="mdi:lightbulb-on-outline"
            className="text-ehs-dark-blue size-3.25 shrink-0"
            aria-hidden="true"
          />
          <Text
            as="span"
            className="text-ehs-dark-blue text-xs font-bold tracking-[1.05px] uppercase"
          >
            Tip
          </Text>
        </div>
        <Text
          as="p"
          className="text-ehs-slate relative z-1 text-sm leading-[17.8px]"
        >
          {tip}
        </Text>
      </div>
    </aside>
  );
}
