"use client";

import Link from "next/link";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import {
  IH_BASE_PATH,
  IH_SAMPLING_PLANS,
  samplingPlanPercent,
  type IhSamplingPlanStatus,
} from "@/components/industrial-hygiene/ih-dashboard-data";

function StatusBadge(props: Readonly<{ status: IhSamplingPlanStatus }>) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-[rgba(8,145,166,0.12)] px-2.5 py-0.5 text-sm font-semibold text-[#0891a6]">
      {props.status}
    </span>
  );
}

/** Sampling Plan Progress card — Figma 5298:22313. */
export function IhSamplingPlanProgressCard() {
  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0"
      incidentGlassCardClassName="gap-1"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Text as="h2" className="text-base font-bold text-[#0b1320]">
          Sampling Plan Progress
        </Text>
        <Link
          href={`${IH_BASE_PATH}/sampling-plans`}
          className="hover:text-ehs-normal-blue text-sm text-[#0b1320] transition-colors"
        >
          View all →
        </Link>
      </div>

      <ul className="flex flex-col gap-4">
        {IH_SAMPLING_PLANS.map((plan) => {
          const percent = samplingPlanPercent(plan);

          return (
            <li
              key={plan.id}
              className="border-b border-[rgba(15,23,42,0.06)] pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text
                  as="p"
                  className="min-w-0 text-base leading-4 font-semibold text-[#2a3446]"
                >
                  {plan.title}
                </Text>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm text-[#8892a3] tabular-nums">
                    {`${String(plan.completed)}/${String(plan.total)}`}
                  </span>
                  <StatusBadge status={plan.status} />
                </div>
              </div>

              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                <div
                  className="bg-ehs-normal-blue h-full rounded-full"
                  style={{ width: `${String(percent)}%` }}
                />
              </div>
              <Text as="p" className="mt-1.5 text-sm leading-4 text-[#b3bbc8]">
                {`${String(percent)}% complete`}
              </Text>
            </li>
          );
        })}
      </ul>
    </IncidentGlassCard>
  );
}
