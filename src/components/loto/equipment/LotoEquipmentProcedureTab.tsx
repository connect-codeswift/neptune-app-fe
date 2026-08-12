"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { LotoEquipmentDetail } from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

export type LotoEquipmentProcedureTabProps = Readonly<{
  detail: LotoEquipmentDetail;
}>;

/** Procedure tab — Figma 6888:51896. */
export function LotoEquipmentProcedureTab(
  props: LotoEquipmentProcedureTabProps,
) {
  const { detail } = props;
  const stepCount = detail.procedureSteps.length;

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-3.5 flex gap-3 border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] px-4 py-3.5">
          <Icon
            icon="mdi:shield-alert-outline"
            className="mt-0.5 size-4 shrink-0 text-[#ef4444]"
            aria-hidden="true"
          />
          <p className="text4 text-[#2a3446]">
            <span className="font-bold text-[#ef4444]">
              Authorized Personnel Only.
            </span>{" "}
            This procedure must be followed exactly. Failure to comply may
            result in serious injury or death from unexpected energization.
          </p>
        </div>

        <div>
          <h2 className="text3 text-ehs-darker mb-2.5">
            Energy Sources to Isolate
          </h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {detail.energySources.map((source, index) => (
              <div
                key={source}
                className="rounded-3 bg-[rgba(15,23,42,0.04)] px-4 py-3.5"
              >
                <p className="text4 text-ehs-darker font-semibold">{source}</p>
                <p className="text8 mt-0.5 text-[#8892a3]">
                  {`Point ${String(index + 1)} of ${String(detail.energySources.length)}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="min-w-0"
        >
          <div className="border-b border-[rgba(15,23,42,0.08)] px-5 py-3.5">
            <h2 className="text3 text-ehs-darker">
              {`Procedure — ${String(stepCount)} Steps`}
            </h2>
          </div>
          <ol className="flex flex-col gap-1 p-3.5">
            {detail.procedureSteps.map((step, index) => {
              const isLast = index === stepCount - 1;

              return (
                <li key={step.id} className="flex gap-3.5 px-2.5 py-3">
                  <div className="flex flex-col items-center">
                    <span className="text5 flex size-7.5 shrink-0 items-center justify-center rounded-3.75 bg-[rgba(8,145,166,0.12)] text-[#0891a6]">
                      {String(index + 1)}
                    </span>
                    {!isLast ? (
                      <span className="mt-1 min-h-8 w-px flex-1 bg-[rgba(15,23,42,0.08)]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <span className="text6 inline-flex rounded-1.25 bg-[rgba(15,23,42,0.05)] px-2 py-0.5 text-[#8892a3]">
                      {step.tag}
                    </span>
                    <p className="text4 mt-1.5 text-[#2a3446]">
                      {step.description}
                    </p>
                    {step.critical ? (
                      <p className="text4 mt-2 flex items-center gap-1.5 font-semibold text-[#ef4444]">
                        <Icon
                          icon="mdi:shield-alert-outline"
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        Critical — must not be skipped
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </IncidentGlassCard>
      </div>

      <IncidentGlassCard paddingClassName="p-4.5" className="min-w-0">
        <h2 className="text3 text-ehs-darker mb-3">Procedure Info</h2>
        <dl className="flex flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] py-2.5">
            <dt className="text4 text-[#8892a3]">Procedure ID</dt>
            <dd className="text4 font-semibold text-[#0891a6]">
              {detail.procedureId}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] py-2.5">
            <dt className="text4 text-[#8892a3]">Energy Sources</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(detail.energySources.length)} sources`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] py-2.5">
            <dt className="text4 text-[#8892a3]">Total Steps</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(stepCount)} steps`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text4 text-[#8892a3]">Last Updated</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {detail.procedureLastUpdated}
            </dd>
          </div>
        </dl>
      </IncidentGlassCard>
    </div>
  );
}
