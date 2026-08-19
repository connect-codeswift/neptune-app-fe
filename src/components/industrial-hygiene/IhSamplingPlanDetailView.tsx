"use client";

import { useMemo } from "react";
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

/* The analyte chip fill is pinned to #f3f4f6, a neutral grey rather than the
   blue-tinted `--ehs-surface-raised` (#f8fafc). */

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
        className="text-ehs-muted-text text-xs font-semibold tracking-wide uppercase"
      >
        {props.label}
      </Text>
      <Text as="p" className="text-ehs-dark-bg text-sm font-medium">
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
          <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
            Plan Details
          </Text>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Text
                as="span"
                className="text-ehs-muted-text text-xs font-semibold tracking-wide uppercase"
              >
                Purpose / Scope
              </Text>
              <Text as="p" className="text-ehs-gray text-sm leading-5">
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
            <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
              Target Hazard Agents
            </Text>
            <div className="flex flex-wrap gap-2">
              {detail.agents.map((agent) => (
                <span
                  key={agent}
                  className="bg-ehs-normal-blue/12 text-ehs-normal-blue inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
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
            <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
              Target Work Areas
            </Text>
            <div className="flex flex-wrap gap-2">
              {detail.workAreas.length > 0 ? (
                detail.workAreas.map((area) => (
                  <span
                    key={area}
                    className="text-ehs-gray inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <Text as="p" className="text-ehs-muted-text text-sm">
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
          <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
            Sampling Progress
          </Text>
          <Text as="p" className="text-ehs-normal-blue text-sm font-semibold">
            {progressLabel}
          </Text>
        </div>

        <div className="bg-ehs-surface-inverse/8 h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-ehs-normal-blue h-full rounded-full"
            style={{ width: `${String(percent)}%` }}
          />
        </div>

        <div className="border-ehs-border-ink/8 bg-ehs-surface/30 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-140 border-collapse text-left text-sm">
            <thead>
              <tr className="bg-ehs-surface-inverse/4">
                {["Date", "Agent", "Location", "Result", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="text-ehs-gray px-3 py-3 text-xs font-bold tracking-wide uppercase"
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
                    className="text-ehs-muted-text px-4 py-8 text-center text-sm"
                  >
                    No sample results yet.
                  </td>
                </tr>
              ) : (
                detail.samples.map((sample) => (
                  <tr
                    key={sample.id}
                    className="border-ehs-border-ink/8 border-t"
                  >
                    <td className="text-ehs-muted-text px-4 py-2.5 text-sm font-medium">
                      {sample.date}
                    </td>
                    <td className="text-ehs-dark-bg px-4 py-2.5 text-sm font-semibold">
                      {sample.agent}
                    </td>
                    <td className="text-ehs-gray px-4 py-2.5 text-sm">
                      {sample.location}
                    </td>
                    <td className="text-ehs-dark-bg px-4 py-2.5 text-sm font-bold">
                      {sample.result}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-ehs-green inline-flex items-center gap-1 text-xs font-semibold">
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
          <Text as="h2" className="text-ehs-dark-bg text-base font-bold">
            Additional Notes
          </Text>
          <Text as="p" className="text-ehs-gray text-sm leading-5">
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
            <Text as="h1" className="text-ehs-dark-bg text-lg font-bold">
              Plan not found
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
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
                className="text-ehs-slate rounded-lg px-3.5 py-2 text-sm font-semibold"
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
                className="text-ehs-slate rounded-lg px-3.5 py-2 text-sm font-semibold"
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
