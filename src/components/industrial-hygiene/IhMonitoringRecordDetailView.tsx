"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import {
  getIhMonitoringDetail,
  ihActionLevelScalePercent,
  IH_MONITORING_RECORDS_PATH,
  ihResultScalePercent,
  type IhMonitoringDetail,
} from "@/components/industrial-hygiene/ih-monitoring-record-detail-data";
import type { IhMonitoringStatus } from "@/components/industrial-hygiene/ih-monitoring-records-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

function DetailStatusBadge(props: Readonly<{ status: IhMonitoringStatus }>) {
  const isExceeded = props.status === "Exceeded";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isExceeded
          ? "bg-ehs-red/12 text-ehs-red"
          : "bg-ehs-green/12 text-ehs-normal-blue",
      ].join(" ")}
    >
      <Icon
        icon={isExceeded ? "mdi:alert-circle" : "mdi:check-circle"}
        className="size-3"
        aria-hidden
      />
      {props.status}
    </span>
  );
}

function InfoField(props: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Text as="span" className="text-ehs-muted-text text-xs font-medium">
        {props.label}
      </Text>
      <Text as="p" className="text-ehs-dark-bg text-sm font-semibold">
        {props.value}
      </Text>
    </div>
  );
}

function ResultSummaryCard(props: Readonly<{ detail: IhMonitoringDetail }>) {
  const { detail } = props;
  const resultPercent = ihResultScalePercent(detail);
  const actionPercent = ihActionLevelScalePercent(detail);

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <Text as="span" className="text-ehs-muted-text text-xs">
            Result
          </Text>
          <p className="text-ehs-normal-blue pt-1 text-4xl leading-none font-black tracking-tight">
            {`${detail.resultValue} `}
            <span className="text-ehs-muted-text text-lg font-normal">
              {detail.resultUnit}
            </span>
          </p>
        </div>
        <DetailStatusBadge status={detail.status} />
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="text-ehs-muted-text flex items-start justify-between gap-2 text-xs">
          <span>{`0 ${detail.resultUnit}`}</span>
          <span>{`Action Level (${detail.actionLevel})`}</span>
          <span>{`OEL (${detail.oelLimit} ${detail.resultUnit})`}</span>
        </div>
        <div className="bg-ehs-surface-inverse/8 relative h-2.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-ehs-surface-inverse/14 absolute inset-y-0 left-0"
            style={{ width: `${String(actionPercent)}%` }}
          />
          <div
            className="bg-ehs-normal-blue absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${String(resultPercent)}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}

function SampleInformationCard(
  props: Readonly<{ detail: IhMonitoringDetail }>,
) {
  const { detail } = props;
  const fields = [
    { label: "Agent", value: detail.agent },
    { label: "Employee / Group", value: detail.employee },
    { label: "Work Area", value: detail.workArea },
    { label: "Sampling Method", value: detail.method },
    { label: "Sample Duration", value: detail.sampleDuration },
    { label: "Sample Date", value: detail.sampleDate },
    { label: "Laboratory", value: detail.laboratory },
    { label: "Linked Plan", value: detail.linkedPlan },
    { label: "Record ID", value: detail.code },
  ];

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-3.5"
    >
      <Text as="h2" className="text-ehs-dark-bg text-sm font-bold">
        Sample Information
      </Text>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <InfoField
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>
    </IncidentGlassCard>
  );
}

function OelReferenceCard(props: Readonly<{ detail: IhMonitoringDetail }>) {
  const { detail } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-3.5"
    >
      <Text as="h2" className="text-ehs-dark-bg text-sm font-bold">
        {`OEL Reference — ${detail.agent}`}
      </Text>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-left">
          <thead>
            <tr className="border-ehs-border-ink/8 border-b">
              {["Standard", "Limit", "Unit", "% of Limit"].map((heading) => (
                <th
                  key={heading}
                  className="text-ehs-muted-text px-3 py-2 text-xs font-semibold tracking-wide uppercase"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.oelRows.map((row) => (
              <tr
                key={row.id}
                className="border-ehs-border-ink/8 border-b last:border-b-0"
              >
                <td className="text-ehs-slate px-3 py-2 text-xs">
                  {row.standard}
                </td>
                <td className="text-ehs-dark-bg px-3 py-2 text-xs font-bold">
                  {row.limit}
                </td>
                <td className="text-ehs-muted-text px-3 py-2 text-xs">
                  {row.unit}
                </td>
                <td
                  className={[
                    "px-3 py-2 text-xs font-bold",
                    row.percentOfLimit > 100
                      ? "text-ehs-red"
                      : "text-ehs-green",
                  ].join(" ")}
                >
                  {`${String(row.percentOfLimit)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IncidentGlassCard>
  );
}

function AttachmentsCard() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-3"
    >
      <Text as="h2" className="text-ehs-dark-bg text-sm font-bold">
        Attachments
      </Text>
      <div className="border-ehs-border-ink/14 bg-ehs-surface-inverse/2 flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center">
        <Icon
          icon="mdi:paperclip"
          className="text-ehs-muted-text size-5"
          aria-hidden
        />
        <Text as="p" className="text-ehs-muted-text text-xs">
          No attachments yet
        </Text>
        <button
          type="button"
          className="text-ehs-normal-blue text-xs font-semibold hover:underline"
        >
          Upload lab report
        </button>
      </div>
    </IncidentGlassCard>
  );
}

function LinkedCapaCard(props: Readonly<{ message: string }>) {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-2"
    >
      <Text as="h2" className="text-ehs-dark-bg text-sm font-bold">
        Linked CAPA
      </Text>
      <Text as="p" className="text-ehs-muted-text text-sm">
        {props.message}
      </Text>
    </IncidentGlassCard>
  );
}

/** Monitoring record detail — Figma 5348:34282. */
export function IhMonitoringRecordDetailView() {
  const router = useRouter();
  const params = useParams<{ recordId: string }>();
  const recordId = typeof params.recordId === "string" ? params.recordId : "";

  const detail = useMemo(() => getIhMonitoringDetail(recordId), [recordId]);

  if (!detail) {
    return (
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Industrial Hygiene Dashboard"
          showSiteSwitcher
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
          <IhModuleTabs />
          <IncidentGlassCard
            paddingClassName="p-8"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="items-center gap-3 text-center"
          >
            <Text as="h1" className="text-ehs-dark-bg text-lg font-bold">
              Record not found
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              This monitoring record could not be loaded.
            </Text>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                router.push(IH_MONITORING_RECORDS_PATH);
              }}
              className="mt-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              Back to Monitoring Records
            </Button>
          </IncidentGlassCard>
        </div>
      </div>
    );
  }

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
            detail.code,
          ]}
          title={`Monitoring Record — ${detail.code}`}
          subtitle={`${detail.agent} · ${detail.employee} · ${detail.sampleDate}`}
          actions={
            <Button
              type="button"
              variant="tertiary"
              className="text-ehs-slate rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/industrial-hygiene/download.svg"
                alt=""
                width={14}
                height={14}
                className="size-3.5"
              />
              Download Report
            </Button>
          }
        />

        <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,22rem)]">
          <div className="flex min-w-0 flex-col gap-3.5">
            <ResultSummaryCard detail={detail} />
            <SampleInformationCard detail={detail} />
            <OelReferenceCard detail={detail} />
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <AttachmentsCard />
            <LinkedCapaCard message={detail.capaMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
