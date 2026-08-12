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
  className?: string;
}>;

function StatBlock(props: Readonly<{ value: number; label: string }>) {
  const { value, label } = props;
  return (
    <div className="flex flex-col gap-1">
      <Text
        as="p"
        className="text-ehs-dark-bg text-center text1 leading-6.5 font-bold tracking-[-0.52px]"
      >
        {String(value)}
      </Text>
      <Text
        as="p"
        className="text-ehs-muted-text text-center text8 leading-none font-bold tracking-[0.8px] uppercase"
      >
        {label}
      </Text>
    </div>
  );
}

export function HrcaHeaderCard(props: Readonly<HrcaHeaderCardProps>) {
  const { meta, categories, whySteps, actions, className = "" } = props;

  return (
    <IncidentGlassCard
      paddingClassName="overflow-hidden p-0"
      className={className}
    >
      <div
        className="px-6 py-5"
        style={{
          backgroundImage:
            "linear-gradient(120.95deg, rgba(8, 145, 166, 0.22) 0%, rgba(8, 145, 166, 0) 60%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="bg-ehs-normal-blue relative flex size-11.5 shrink-0 items-center justify-center rounded-3.25 shadow-[0px_8px_22px_-8px_#0891a6]">
              <Icon
                icon="mdi:lightning-bolt"
                className="text-ehs-light-text size-5.5"
                aria-hidden="true"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Text
                as="p"
                className="text8 leading-none font-bold tracking-[1.76px] text-[#056e7e] uppercase"
              >
                Horizontal Root Cause Analysis
              </Text>
              <Text
                as="h2"
                className="text-ehs-dark-bg text3 leading-normal font-bold tracking-[-0.18px]"
              >
                5 Whys across causal categories → root cause → corrective
                actions
              </Text>
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-5.5 lg:justify-end">
            <StatBlock value={categories} label="Categories" />
            <StatBlock value={whySteps} label="Why steps" />
            <StatBlock value={actions} label="Actions" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-[rgba(15,23,42,0.08)] sm:grid-cols-[180px_200px_minmax(0,1fr)]">
        <div className="border-[rgba(15,23,42,0.08)] sm:border-r">
          <HrcaMetaField
            icon="mdi:alert-outline"
            label="Type of report"
            labelLines={["Type of", "report"]}
            value={meta.reportType}
            showChevron
            valueClassName="text4 leading-3.25 font-normal"
          />
        </div>
        <div className="border-t border-[rgba(15,23,42,0.08)] sm:border-t-0 sm:border-r">
          <HrcaMetaField
            icon="mdi:calendar-outline"
            label="Date"
            value={meta.date}
            valueClassName="text4 leading-[17.5px] font-bold"
          />
        </div>
        <div className="border-t border-[rgba(15,23,42,0.08)] sm:border-t-0">
          <HrcaMetaField
            icon="mdi:heart-outline"
            label="Injury"
            value={meta.injury}
            valueClassName="text4 leading-[17.5px] font-bold"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-[rgba(15,23,42,0.08)] px-6 pt-3.75 pb-3.5">
        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-2 bg-white/62">
          <Icon
            icon="mdi:file-document-outline"
            className="text-ehs-gray size-3.75"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            className="text-ehs-muted-text text8 leading-none font-bold tracking-[0.945px] uppercase"
          >
            Incident description
          </Text>
          <p className="text-ehs-slate mt-0.5 text4 leading-[19.38px] font-normal">
            {meta.description}
          </p>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
