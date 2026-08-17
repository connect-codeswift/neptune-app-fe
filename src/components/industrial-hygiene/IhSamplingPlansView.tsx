"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IhSearchToolbar } from "@/components/industrial-hygiene/IhSearchToolbar";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  IH_PLAN_LIST,
  ihPlanPercent,
  type IhPlanListItem,
  type IhPlanListStatus,
} from "@/components/industrial-hygiene/ih-sampling-plans-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

function PlanStatusBadge(props: Readonly<{ status: IhPlanListStatus }>) {
  const styles: Record<IhPlanListStatus, string> = {
    "In Progress": "bg-[rgba(8,145,166,0.12)] text-[#0891a6]",
    Approved: "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
    Draft: "bg-[rgba(86,96,114,0.12)] text-[#566072]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold",
        styles[props.status],
      ].join(" ")}
    >
      {props.status}
    </span>
  );
}

function PlanCard(props: Readonly<{ plan: IhPlanListItem }>) {
  const { plan } = props;
  const showProgress = plan.status !== "Draft" && plan.total > 0;
  const percent = ihPlanPercent(plan);

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-0"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Text
              as="span"
              className="font-mono text-sm font-bold text-[#0891a6]"
            >
              {plan.code}
            </Text>
            <PlanStatusBadge status={plan.status} />
          </div>

          <Text
            as="h2"
            className="mt-1.5 text-base leading-6 font-bold text-[#0b1320]"
          >
            {plan.title}
          </Text>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1 text-sm text-[#8892a3]">
              <Icon icon="mdi:account-outline" className="size-3" aria-hidden />
              {plan.owner}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-[#8892a3]">
              <Icon
                icon="mdi:calendar-outline"
                className="size-3"
                aria-hidden
              />
              {`Next: ${plan.nextDate}`}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-[#8892a3]">
              <Icon icon="mdi:flask-outline" className="size-3" aria-hidden />
              {plan.agents}
            </span>
          </div>

          {showProgress ? (
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3">
                <Text as="span" className="text-sm text-[#8892a3]">
                  Samples completed
                </Text>
                <Text
                  as="span"
                  className="text-sm font-semibold text-[#566072]"
                >
                  {`${String(plan.completed)} / ${String(plan.total)} (${String(percent)}%)`}
                </Text>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                <div
                  className="bg-ehs-normal-blue h-full rounded-full"
                  style={{ width: `${String(percent)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Link href={`${IH_BASE_PATH}/sampling-plans/${plan.id}`}>
            <Button
              type="button"
              variant="tertiary"
              className="rounded-lg px-3 py-2 text-base font-semibold text-[#2a3446]"
            >
              <Icon icon="mdi:eye-outline" className="size-4" aria-hidden />
              View
            </Button>
          </Link>
          <Button
            type="button"
            variant="secondary"
            className="rounded-lg bg-[rgba(15,23,42,0.05)] px-3 py-2 text-base font-semibold text-[#2a3446]"
          >
            <Icon icon="mdi:plus" className="size-3" aria-hidden />
            Log Result
          </Button>
        </div>
      </div>
    </IncidentGlassCard>
  );
}

/** Sampling Plans tab — Figma 5305:30614. */
export function IhSamplingPlansView() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return IH_PLAN_LIST;
    return IH_PLAN_LIST.filter(
      (plan) =>
        plan.title.toLowerCase().includes(q) ||
        plan.code.toLowerCase().includes(q) ||
        plan.owner.toLowerCase().includes(q) ||
        plan.agents.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={["Safety", "Industrial Hygiene", "Sampling Plans"]}
          title="Sampling Plans"
          subtitle="Plan and schedule future monitoring campaigns for all hazard agents"
          actions={
            <Link href={`${IH_BASE_PATH}/sampling-plans/new`}>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-base! font-semibold"
              >
                <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
                Create Plan
              </Button>
            </Link>
          }
        />

        <IhSearchToolbar
          value={query}
          onChange={setQuery}
          aria-label="Search sampling plans"
          resultLabel={`${String(filtered.length)} chemicals`}
        />

        <div className="flex flex-col gap-2.5">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
