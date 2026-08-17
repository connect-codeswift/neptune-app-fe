"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  getIhPlanDetail,
  ihPlanDetailPercent,
  type IhPlanDetail,
} from "@/components/industrial-hygiene/ih-sampling-plan-detail-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

function DetailField(
  props: Readonly<{ label: string; value: string; className?: string }>,
) {
  return (
    <div
      className={["flex min-w-0 flex-col gap-1.5", props.className ?? ""].join(
        " ",
      )}
    >
      <Text
        as="span"
        className="text-xs font-semibold tracking-wide text-[#8892a3] uppercase"
      >
        {props.label}
      </Text>
      <Text as="p" className="text-sm font-medium text-[#0b1320]">
        {props.value}
      </Text>
    </div>
  );
}

function PlanDetailBody(props: Readonly<{ detail: IhPlanDetail }>) {
  const { detail } = props;
  const percent = ihPlanDetailPercent(detail);
  const progressLabel =
    detail.total > 0
      ? `${String(detail.completed)} / ${String(detail.total)} Samples Completed (${String(percent)}%)`
      : "No samples scheduled";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <IncidentGlassCard
          paddingClassName="p-7"
          className="min-w-0 rounded-2xl"
          incidentGlassCardClassName="gap-6"
        >
          <Text as="h2" className="text-base font-bold text-[#0b1320]">
            Plan Details
          </Text>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Text
                as="span"
                className="text-xs font-semibold tracking-wide text-[#8892a3] uppercase"
              >
                Purpose / Scope
              </Text>
              <Text as="p" className="text-sm leading-5 text-[#566072]">
                {detail.purpose}
              </Text>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <DetailField
                label="Responsible Person"
                value={detail.responsiblePerson}
              />
              <DetailField
                label="Sampling Frequency"
                value={detail.frequency}
              />
              <DetailField label="Sampling Method" value={detail.method} />
              <DetailField label="Plan Status" value={detail.status} />
              <DetailField label="Start Date" value={detail.startDate} />
              <DetailField label="End Date" value={detail.endDate} />
            </div>
          </div>
        </IncidentGlassCard>

        <div className="flex min-w-0 flex-col gap-5">
          <IncidentGlassCard
            paddingClassName="p-6"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-4"
          >
            <Text as="h2" className="text-base font-bold text-[#0b1320]">
              Target Hazard Agents
            </Text>
            <div className="flex flex-wrap gap-2">
              {detail.agents.map((agent) => (
                <span
                  key={agent}
                  className="inline-flex rounded-full bg-[rgba(8,145,166,0.12)] px-2.5 py-0.5 text-xs font-semibold text-[#0891a6]"
                >
                  {agent}
                </span>
              ))}
            </div>
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-6"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-4"
          >
            <Text as="h2" className="text-base font-bold text-[#0b1320]">
              Target Work Areas
            </Text>
            <div className="flex flex-wrap gap-2">
              {detail.workAreas.length > 0 ? (
                detail.workAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-semibold text-[#566072]"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <Text as="p" className="text-sm text-[#8892a3]">
                  No work areas listed
                </Text>
              )}
            </div>
          </IncidentGlassCard>
        </div>
      </div>

      <IncidentGlassCard
        paddingClassName="p-7"
        className="min-w-0 rounded-2xl"
        incidentGlassCardClassName="gap-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text as="h2" className="text-base font-bold text-[#0b1320]">
            Sampling Progress
          </Text>
          <Text as="p" className="text-sm font-semibold text-[#0891a6]">
            {progressLabel}
          </Text>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(percent)}%` }}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(15,23,42,0.08)] bg-white/30">
          <table className="w-full min-w-140 border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[rgba(15,23,42,0.04)]">
                {["Date", "Agent", "Location", "Result", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-xs font-bold tracking-wide text-[#566072] uppercase"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {detail.samples.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-[#8892a3]"
                  >
                    No sample results yet.
                  </td>
                </tr>
              ) : (
                detail.samples.map((sample) => (
                  <tr
                    key={sample.id}
                    className="border-t border-[rgba(15,23,42,0.08)]"
                  >
                    <td className="px-4 py-2.5 text-sm font-medium text-[#8892a3]">
                      {sample.date}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-[#0b1320]">
                      {sample.agent}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-[#566072]">
                      {sample.location}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-bold text-[#0b1320]">
                      {sample.result}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10b981]">
                        <Icon
                          icon="mdi:check-circle"
                          className="size-3.5"
                          aria-hidden
                        />
                        {sample.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </IncidentGlassCard>

      {detail.notes ? (
        <IncidentGlassCard
          paddingClassName="p-6"
          className="min-w-0 rounded-2xl"
          incidentGlassCardClassName="gap-3"
        >
          <Text as="h2" className="text-base font-bold text-[#0b1320]">
            Additional Notes
          </Text>
          <Text as="p" className="text-sm leading-5 text-[#566072]">
            {detail.notes}
          </Text>
        </IncidentGlassCard>
      ) : null}
    </div>
  );
}

/** Sampling Plan detail — Figma 5305:30088. */
export function IhSamplingPlanDetailView() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();
  const planId = typeof params.planId === "string" ? params.planId : "";

  const detail = useMemo(() => getIhPlanDetail(planId), [planId]);

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
              Plan not found
            </Text>
            <Text as="p" className="text-sm text-[#8892a3]">
              This sampling plan could not be loaded.
            </Text>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                router.push(`${IH_BASE_PATH}/sampling-plans`);
              }}
              className="mt-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              Back to Sampling Plans
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
            "Sampling Plans",
            detail.title,
          ]}
          title={detail.title}
          subtitle={detail.subtitle}
          actions={
            <>
              <Button
                type="button"
                variant="tertiary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
              >
                <Icon
                  icon="mdi:pencil-outline"
                  className="size-3.5"
                  aria-hidden
                />
                Edit Plan
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold"
              >
                <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
                Log Result
              </Button>
              <Button
                type="button"
                variant="tertiary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
              >
                <Icon
                  icon="mdi:download-outline"
                  className="size-3.5"
                  aria-hidden
                />
                Export
              </Button>
            </>
          }
        />

        <PlanDetailBody detail={detail} />
      </div>
    </div>
  );
}
