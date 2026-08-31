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
  const sourceCount = detail.energySources.length;

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-5">
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

        <section>
          <h2 className="text3 text-ehs-darker mb-2.5">
            Energy Sources to Isolate
          </h2>
          {/*
           * Chips, not cards. Each source is a single word derived from the
           * steps below, and a half-width panel per word left the section
           * mostly empty while reading as heavier than the procedure it only
           * introduces. The "Point n of n" line under each said nothing the
           * numbered steps do not already say, and counted sources as though
           * they were ordered — they are not.
           */}
          {sourceCount > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {detail.energySources.map((source) => (
                <li
                  key={source}
                  className="text8 rounded-2 text-ehs-slate bg-ehs-surface-inverse/5 border-ehs-border-ink/8 border px-2.5 py-1 font-medium"
                >
                  {source}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text8 text-ehs-muted-text">
              No energy sources recorded — they are derived from the isolation
              steps below.
            </p>
          )}
        </section>

        <section>
          {/*
           * The count lives in Procedure Info beside this, so the heading does
           * not repeat it — which is also what produced "Procedure — 1 Steps".
           */}
          <h2 className="text3 text-ehs-darker mb-1">Procedure</h2>

          {/*
           * No card around the list. It sat inside a panel with its own header
           * bar and padding, which framed a numbered sequence that already
           * reads as one — the rail down the left is the structure, so the
           * chrome around it was only weight.
           */}
          {stepCount > 0 ? (
            <ol className="flex flex-col">
              {detail.procedureSteps.map((step, index) => {
                const isLast = index === stepCount - 1;
                const meta = [
                  step.isolationPoint
                    ? `Isolation point: ${step.isolationPoint}`
                    : null,
                  step.lockTagPosition
                    ? `Lock/tag: ${step.lockTagPosition}`
                    : null,
                ].filter(Boolean);

                return (
                  <li key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text8 text-ehs-normal-blue bg-ehs-normal-blue/10 mt-3 flex size-6 shrink-0 items-center justify-center rounded-full font-semibold tabular-nums">
                        <span className="sr-only">Step </span>
                        {index + 1}
                      </span>
                      {/* The rail is what makes this read as a sequence
                          performed in order rather than a list of facts. */}
                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className="bg-ehs-border-ink/10 mt-1.5 w-px flex-1"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 pt-3 pb-1 last:pb-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <p className="text4 text-ehs-darker font-medium">
                          {step.description}
                        </p>
                        {step.tag ? (
                          <span className="text6 text-ehs-muted-text bg-ehs-surface-inverse/5 rounded px-1.5 py-px">
                            {step.tag}
                          </span>
                        ) : null}
                      </div>
                      {meta.length > 0 ? (
                        <p className="text8 text-ehs-muted-text mt-1">
                          {meta.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text8 text-ehs-muted-text">
              No isolation steps recorded for this equipment.
            </p>
          )}
        </section>
      </div>

      <IncidentGlassCard paddingClassName="p-4.5" className="min-w-0">
        <h2 className="text3 text-ehs-darker mb-3">Procedure Info</h2>
        <dl className="flex flex-col">
          <div className="border-ehs-border-ink/8 flex items-center justify-between gap-3 border-b py-2.5">
            <dt className="text4 text-ehs-muted-text">Energy Sources</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(sourceCount)} ${sourceCount === 1 ? "source" : "sources"}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text4 text-ehs-muted-text">Total Steps</dt>
            <dd className="text4 text-ehs-darker font-semibold">
              {`${String(stepCount)} ${stepCount === 1 ? "step" : "steps"}`}
            </dd>
          </div>
        </dl>
      </IncidentGlassCard>
    </div>
  );
}
