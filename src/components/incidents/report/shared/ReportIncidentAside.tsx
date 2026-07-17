"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  SITE_STATS,
  STEP_TIPS,
  type ReportStepId,
} from "@/components/incidents/report/shared/report-incident-data";

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

  const locationPreview = location
    ? location.replace(/\s*—\s*Press\s*#?\d+/i, " — Press").trim()
    : "Plant / location…";

  const hasTitle = title.trim().length > 0;
  const hasDescription = description.trim().length > 0;
  const tip = STEP_TIPS[currentStep];

  return (
    <aside
      className={[
        "flex w-full flex-col gap-3.5 lg:sticky lg:top-0 lg:w-[320px] lg:shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <IncidentGlassCard paddingClassName="p-[17px]" className="gap-0">
        <Text
          as="p"
          className="text-ehs-muted-text text-[10.5px] font-bold tracking-[1.05px] uppercase"
        >
          Live preview
        </Text>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 pt-1">
          <Text
            as="span"
            className="text-ehs-muted-text text-[10.5px] font-bold"
          >
            INC-DRAFT
          </Text>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,19,32,0.14)] px-[9px] py-[2.5px]">
            <span className="bg-ehs-gray size-1.5 rounded-[3px]" />
            <Text
              as="span"
              className="text-ehs-gray text-[10.7px] font-bold tracking-[0.22px]"
            >
              {severityBadge}
            </Text>
          </span>
        </div>

        <p
          className={[
            "mt-1 min-h-[38px] pt-0.5 pb-5 text-[13.5px] leading-[18px]",
            hasTitle
              ? "text-ehs-dark-bg font-bold not-italic"
              : "text-ehs-muted-text italic",
          ].join(" ")}
        >
          {hasTitle ? title : "Title appears here…"}
        </p>

        <Text
          as="p"
          className="text-ehs-muted-text pb-[7px] text-[11px] leading-normal"
        >
          {locationPreview}
        </Text>

        <div className="h-px w-full bg-[rgba(15,23,42,0.08)]" />

        <p
          className={[
            "max-h-[70px] overflow-hidden pt-1.5 text-[11.5px] leading-[17px]",
            hasDescription
              ? "text-ehs-gray not-italic"
              : "text-ehs-muted-text italic",
          ].join(" ")}
        >
          {hasDescription ? description : "Description preview…"}
        </p>
      </IncidentGlassCard>

      <IncidentGlassCard paddingClassName="p-[17px]">
        <Text
          as="p"
          className="text-ehs-muted-text mb-2.5 text-[10.5px] font-bold tracking-[1.05px] uppercase"
        >
          At this site
        </Text>
        <div className="flex flex-col gap-2.5">
          {SITE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-3"
            >
              <Text as="span" className="text-ehs-gray text-[11.5px]">
                {stat.label}
              </Text>
              <Text
                as="span"
                className="text-ehs-dark-bg text-[12.7px] font-bold"
              >
                {stat.value}
              </Text>
            </div>
          ))}
        </div>
      </IncidentGlassCard>

      <div className="relative flex flex-col gap-[7px] rounded-[20px] border border-[rgba(8,145,166,0.3)] bg-[rgba(8,145,166,0.18)] p-[17px] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)] before:content-['']">
        <div className="relative z-[1] flex items-center gap-1.5">
          <Icon
            icon="mdi:lightbulb-on-outline"
            className="text-ehs-dark-blue size-[13px] shrink-0"
            aria-hidden="true"
          />
          <Text
            as="span"
            className="text-ehs-dark-blue text-[10.5px] font-bold tracking-[1.05px] uppercase"
          >
            Tip
          </Text>
        </div>
        <Text
          as="p"
          className="relative z-[1] text-[11.5px] leading-[17.8px] text-[#2a3446]"
        >
          {tip}
        </Text>
      </div>
    </aside>
  );
}
