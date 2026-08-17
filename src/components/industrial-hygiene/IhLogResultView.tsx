"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  computeIhOelComparison,
  createLogResultSchema,
  formatIhOelValue,
  getIhLogResultAgent,
  IH_LOG_RESULT_FORM_ID,
  IH_LOG_RESULT_INITIAL_VALUES,
  type IhAgentOelRef,
  type IhOelComparison,
} from "@/components/industrial-hygiene/ih-log-result-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";

function OelReferenceRow(
  props: Readonly<{ label: string; value: string; isLast?: boolean }>,
) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 py-1.5",
        props.isLast ? "" : "border-b border-[rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <Text as="span" className="text-xs text-[#566072]">
        {props.label}
      </Text>
      <Text as="span" className="text-xs font-bold text-[#0b1320]">
        {props.value}
      </Text>
    </div>
  );
}

function OelComparisonCard(
  props: Readonly<{ comparison: IhOelComparison | null }>,
) {
  const { comparison } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-2.5"
    >
      <Text
        as="p"
        className="text-center text-xs font-semibold tracking-wider text-[#8892a3] uppercase"
      >
        OEL Comparison
      </Text>

      {comparison ? (
        <div className="flex flex-col items-center gap-2 pt-1">
          <Text as="p" className="text-2xl font-bold text-[#0b1320]">
            {comparison.resultLabel}
          </Text>
          <Text as="p" className="text-sm text-[#566072]">
            {`${String(comparison.percentOfInternal)}% of internal limit (${comparison.limitLabel})`}
          </Text>
          <span
            className={[
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
              comparison.status === "Exceeded"
                ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]"
                : "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
            ].join(" ")}
          >
            {comparison.status}
          </span>
        </div>
      ) : (
        <Text as="p" className="pt-2.5 text-center text-sm text-[#b3bbc8]">
          Enter a result value to see OEL comparison
        </Text>
      )}
    </IncidentGlassCard>
  );
}

function OelReferenceCard(props: Readonly<{ agent: IhAgentOelRef | null }>) {
  const { agent } = props;
  const unit = agent?.unit ?? "—";

  const rows = [
    {
      label: "OSHA PEL",
      value: agent ? formatIhOelValue(agent.oshaPel, unit) : "—",
    },
    {
      label: "ACGIH TLV",
      value: agent ? formatIhOelValue(agent.acgihTlv, unit) : "—",
    },
    {
      label: "NIOSH REL",
      value: agent ? formatIhOelValue(agent.nioshRel, unit) : "—",
    },
    {
      label: "Internal Limit",
      value: agent ? formatIhOelValue(agent.internalLimit, unit) : "—",
    },
  ];

  return (
    <IncidentGlassCard
      paddingClassName="p-4"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-0"
    >
      <Text as="h2" className="text-sm font-bold text-[#0b1320]">
        OEL Reference
      </Text>
      <div className="mt-2.5 flex flex-col">
        {rows.map((row, index) => (
          <OelReferenceRow
            key={row.label}
            label={row.label}
            value={row.value}
            isLast={index === rows.length - 1}
          />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

/** Log Monitoring Result — Figma 5313:32963. */
export function IhLogResultView() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(
    IH_LOG_RESULT_INITIAL_VALUES,
  );

  const agentId = typeof values.agent === "string" ? values.agent : "";
  const resultRaw = typeof values.result === "string" ? values.result : "";

  const agent = useMemo(() => getIhLogResultAgent(agentId), [agentId]);
  const schema = useMemo(() => createLogResultSchema(agentId), [agentId]);
  const comparison = useMemo(
    () => computeIhOelComparison(resultRaw, agent),
    [resultRaw, agent],
  );

  const goBack = () => {
    router.push(`${IH_BASE_PATH}/monitoring-records`);
  };

  const handleSubmit = () => {
    toast.success("Monitoring result saved");
    goBack();
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={[
            "Safety",
            "Industrial Hygiene",
            "Monitoring Records",
            "New Result",
          ]}
          title="Log Monitoring Result"
          subtitle="Record an exposure sample result — OEL comparison is calculated automatically"
        />

        <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,22rem)]">
          <IncidentGlassCard
            paddingClassName="p-7"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-0"
          >
            <FormBuilder
              formId={IH_LOG_RESULT_FORM_ID}
              schema={schema}
              initialValues={IH_LOG_RESULT_INITIAL_VALUES}
              onSubmit={handleSubmit}
              onChange={setValues}
              hideActions
              className="gap-4"
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
              >
                <Icon icon="mdi:arrow-left" className="size-3.5" aria-hidden />
                Cancel
              </Button>

              <Button
                type="submit"
                form={IH_LOG_RESULT_FORM_ID}
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                Save Record
              </Button>
            </div>
          </IncidentGlassCard>

          <div className="flex min-w-0 flex-col gap-3.5">
            <OelComparisonCard comparison={comparison} />
            <OelReferenceCard agent={agent} />
          </div>
        </div>

        <div>
          <Link
            href={`${IH_BASE_PATH}/monitoring-records`}
            className="text-ehs-normal-blue inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          >
            <Icon icon="mdi:arrow-left" className="size-4" aria-hidden />
            Back to Monitoring Records
          </Link>
        </div>
      </div>
    </div>
  );
}
