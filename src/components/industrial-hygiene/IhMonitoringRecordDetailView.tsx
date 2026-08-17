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
          ? "bg-[rgba(239,68,68,0.12)] text-[#ef4444]"
          : "bg-[rgba(16,185,129,0.12)] text-[#0891a6]",
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
      <Text as="span" className="text-xs font-medium text-[#8892a3]">
        {props.label}
      </Text>
      <Text as="p" className="text-sm font-semibold text-[#0b1320]">
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
          <Text as="span" className="text-xs text-[#8892a3]">
            Result
          </Text>
          <p className="pt-1 text-4xl leading-none font-black tracking-tight text-[#0891a6]">
            {`${detail.resultValue} `}
            <span className="text-lg font-normal text-[#8892a3]">
              {detail.resultUnit}
            </span>
          </p>
        </div>
        <DetailStatusBadge status={detail.status} />
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2 text-xs text-[#8892a3]">
          <span>{`0 ${detail.resultUnit}`}</span>
          <span>{`Action Level (${detail.actionLevel})`}</span>
          <span>{`OEL (${detail.oelLimit} ${detail.resultUnit})`}</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
          <div
            className="absolute inset-y-0 left-0 bg-[rgba(11,19,32,0.14)]"
            style={{ width: `${String(actionPercent)}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#0891a6]"
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
      <Text as="h2" className="text-sm font-bold text-[#0b1320]">
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
      <Text as="h2" className="text-sm font-bold text-[#0b1320]">
        {`OEL Reference — ${detail.agent}`}
      </Text>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-left">
          <thead>
            <tr className="border-b border-[rgba(15,23,42,0.08)]">
              {["Standard", "Limit", "Unit", "% of Limit"].map((heading) => (
                <th
                  key={heading}
                  className="px-3 py-2 text-xs font-semibold tracking-wide text-[#8892a3] uppercase"
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
                className="border-b border-[rgba(15,23,42,0.08)] last:border-b-0"
              >
                <td className="px-3 py-2 text-xs text-[#2a3446]">
                  {row.standard}
                </td>
                <td className="px-3 py-2 text-xs font-bold text-[#0b1320]">
                  {row.limit}
                </td>
                <td className="px-3 py-2 text-xs text-[#8892a3]">{row.unit}</td>
                <td
                  className={[
                    "px-3 py-2 text-xs font-bold",
                    row.percentOfLimit > 100
                      ? "text-[#ef4444]"
                      : "text-[#10b981]",
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
      <Text as="h2" className="text-sm font-bold text-[#0b1320]">
        Attachments
      </Text>
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-[rgba(15,23,42,0.14)] bg-[rgba(15,23,42,0.02)] px-4 py-6 text-center">
        <Icon
          icon="mdi:paperclip"
          className="size-5 text-[#8892a3]"
          aria-hidden
        />
        <Text as="p" className="text-xs text-[#8892a3]">
          No attachments yet
        </Text>
        <button
          type="button"
          className="text-xs font-semibold text-[#0891a6] hover:underline"
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
      <Text as="h2" className="text-sm font-bold text-[#0b1320]">
        Linked CAPA
      </Text>
      <Text as="p" className="text-sm text-[#8892a3]">
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
            <Text as="h1" className="text-lg font-bold text-[#0b1320]">
              Record not found
            </Text>
            <Text as="p" className="text-sm text-[#8892a3]">
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
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
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
