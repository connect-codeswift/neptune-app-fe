"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { HrcaMetaField } from "@/components/incidents/detail/investigations/hrca/HrcaMetaField";
import type { HrcaMeta } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type HrcaHeaderCardProps = Readonly<{
  meta: HrcaMeta;
  categories: number;
  whySteps: number;
  actions: number;
  onClose?: () => void;
  className?: string;
}>;

function StatBlock(props: Readonly<{ value: number; label: string }>) {
  const { value, label } = props;
  return (
    <div className="flex flex-col items-center gap-1">
      <Text
        as="p"
        className="text-ehs-dark-bg text-[26px] leading-[26px] font-bold tracking-[-0.52px]"
      >
        {String(value)}
      </Text>
      <Text
        as="p"
        className="text-ehs-muted-text text-[10px] font-bold tracking-[0.8px] uppercase"
      >
        {label}
      </Text>
    </div>
  );
}

export function HrcaHeaderCard(props: Readonly<HrcaHeaderCardProps>) {
  const {
    meta,
    categories,
    whySteps,
    actions,
    onClose,
    className = "",
  } = props;

  return (
    <IncidentGlassCard
      paddingClassName="overflow-hidden p-0"
      className={className}
    >
      {/* Title + stats */}
      <div
        className="flex items-center gap-4 px-6 py-5"
        style={{
          backgroundImage:
            "linear-gradient(121deg, rgba(8, 145, 166, 0.22) 0%, rgba(8, 145, 166, 0) 60%)",
        }}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-ehs-gray hover:text-ehs-dark-bg inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(15,23,42,0.08)] bg-white/70 transition-colors"
            title="Back to investigation"
          >
            <Icon icon="mdi:arrow-left" className="size-4" aria-hidden="true" />
          </button>
        ) : null}

        <div className="bg-ehs-normal-blue relative flex size-[46px] shrink-0 items-center justify-center rounded-[13px] shadow-[0px_8px_22px_-8px_#0891a6]">
          <Icon
            icon="mdi:lightning-bolt"
            className="size-[22px] text-white"
            aria-hidden="true"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text
            as="p"
            className="text-ehs-dark-blue text-[11px] font-bold tracking-[1.76px] uppercase"
          >
            Horizontal Root Cause Analysis
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg text-[18px] font-bold tracking-[-0.18px]"
          >
            5 Whys across causal categories → root cause → corrective actions
          </Text>
        </div>

        <div className="hidden shrink-0 items-start gap-[22px] sm:flex">
          <StatBlock value={categories} label="Categories" />
          <StatBlock value={whySteps} label="Why steps" />
          <StatBlock value={actions} label="Actions" />
        </div>
      </div>

      {/* Meta: type / date / injury */}
      <div className="grid grid-cols-1 border-t border-[rgba(15,23,42,0.08)] sm:grid-cols-[180px_200px_minmax(0,1fr)]">
        <div className="border-[rgba(15,23,42,0.08)] sm:border-r">
          <HrcaMetaField
            icon="mdi:alert-outline"
            label="Type of report"
            labelLines={["Type of", "report"]}
            value={meta.reportType}
            showChevron
          />
        </div>
        <div className="border-[rgba(15,23,42,0.08)] sm:border-r">
          <HrcaMetaField
            icon="mdi:calendar-outline"
            label="Date"
            value={meta.date}
          />
        </div>
        <HrcaMetaField
          icon="mdi:heart-outline"
          label="Injury"
          value={meta.injury}
        />
      </div>

      {/* Description */}
      <div className="flex items-start gap-3 border-t border-[rgba(15,23,42,0.08)] px-6 pt-[15px] pb-3.5">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-white/62">
          <Icon
            icon="mdi:file-document-outline"
            className="text-ehs-gray size-[15px]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            className="text-ehs-muted-text text-[10.5px] font-bold tracking-[0.945px] uppercase"
          >
            Incident description
          </Text>
          <p className="mt-0.5 text-[12.3px] leading-[19.38px] text-[#2a3446]">
            {meta.description}
          </p>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
