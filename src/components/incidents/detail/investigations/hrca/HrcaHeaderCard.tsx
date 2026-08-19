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
        className="text-ehs-dark-bg text1 text-center leading-6.5 font-bold tracking-[-0.52px]"
      >
        {String(value)}
      </Text>
      <Text
        as="p"
        className="text-ehs-muted-text text8 text-center leading-none font-bold tracking-[0.8px] uppercase"
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
            "linear-gradient(120.95deg, color-mix(in oklab, var(--ehs-normal-blue) 22%, transparent) 0%, transparent 60%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="bg-ehs-normal-blue rounded-3.25 relative flex size-11.5 shrink-0 items-center justify-center shadow-[0px_8px_22px_-8px_var(--ehs-normal-blue)]">
              <Icon
                icon="mdi:lightning-bolt"
                className="text-ehs-light-text size-5.5"
                aria-hidden="true"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Text
                as="p"
                className="text8 text-ehs-dark-blue leading-none font-bold tracking-[1.76px] uppercase"
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

      <div className="border-ehs-border-ink/8 grid grid-cols-1 border-t sm:grid-cols-[180px_200px_minmax(0,1fr)]">
        <div className="border-ehs-border-ink/8 sm:border-r">
          <HrcaMetaField
            icon="mdi:alert-outline"
            label="Type of report"
            labelLines={["Type of", "report"]}
            value={meta.reportType}
            showChevron
            valueClassName="text4 leading-3.25 font-normal"
          />
        </div>
        <div className="border-ehs-border-ink/8 border-t sm:border-t-0 sm:border-r">
          <HrcaMetaField
            icon="mdi:calendar-outline"
            label="Date"
            value={meta.date}
            valueClassName="text4 leading-[17.5px] font-bold"
          />
        </div>
        <div className="border-ehs-border-ink/8 border-t sm:border-t-0">
          <HrcaMetaField
            icon="mdi:heart-outline"
            label="Injury"
            value={meta.injury}
            valueClassName="text4 leading-[17.5px] font-bold"
          />
        </div>
      </div>

      <div className="border-ehs-border-ink/8 flex items-start gap-3 border-t px-6 pt-3.75 pb-3.5">
        <div className="rounded-2 bg-ehs-surface/62 flex size-7.5 shrink-0 items-center justify-center">
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
          <p className="text-ehs-slate text4 mt-0.5 leading-[19.38px] font-normal">
            {meta.description}
          </p>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
