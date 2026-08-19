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
        <div className="rounded-3.5 border-ehs-red/25 bg-ehs-red/6 flex gap-3 border px-4 py-3.5">
          <Icon
            icon="mdi:shield-alert-outline"
            className="text-ehs-red mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p className="text4 text-ehs-slate">
            <span className="text-ehs-red font-bold">
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
                className="rounded-3 bg-ehs-surface-inverse/4 px-4 py-3.5"
              >
                <p className="text4 text-ehs-darker font-semibold">{source}</p>
                <p className="text8 text-ehs-muted-text mt-0.5">
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
          <div className="border-ehs-border-ink/8 border-b px-5 py-3.5">
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
                    <span className="text5 rounded-3.75 text-ehs-normal-blue bg-ehs-normal-blue/12 flex size-7.5 shrink-0 items-center justify-center">
                      {String(index + 1)}
                    </span>
                    {!isLast ? (
                      <span className="bg-ehs-surface-inverse/8 mt-1 min-h-8 w-px flex-1" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <span className="text6 rounded-1.25 text-ehs-muted-text bg-ehs-surface-inverse/5 inline-flex px-2 py-0.5">
                      {step.tag}
                    </span>
                    <p className="text4 text-ehs-slate mt-1.5">
                      {step.description}
                    </p>
                    {step.isolationPoint || step.lockTagPosition ? (
                      <p className="text8 text-ehs-muted-text mt-1.5">
                        {[
                          step.isolationPoint
                            ? `Isolation point: ${step.isolationPoint}`
                            : null,
                          step.lockTagPosition
                            ? `Lock/tag: ${step.lockTagPosition}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
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
          <div className="border-ehs-border-ink/8 flex items-center justify-between gap-3 border-b py-2.5">
            <dt className="text4 text-ehs-muted-text">Energy Sources</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(detail.energySources.length)} sources`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text4 text-ehs-muted-text">Total Steps</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(stepCount)} steps`}
            </dd>
          </div>
        </dl>
      </IncidentGlassCard>
    </div>
  );
}
