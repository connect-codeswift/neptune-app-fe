"use client";

import { Icon } from "@iconify/react";
import { AiTextAssistant } from "@/components/ai/AiTextAssistant";
import { Text } from "@/components/Text";
import type {
  ClosureLinkedCapaItem,
  IncidentClosureData,
} from "@/components/incidents/detail/incident-detail-types";
import { FIELD_TEXTAREA_WITH_CONTROLS_CLASS } from "@/components/ui/field-styles";
import { capaStatusPillClass } from "@/lib/capa-filters";

export type IncidentClosureStepPreventiveProps = Readonly<{
  data: IncidentClosureData;
  onChangeField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleCheckItem?: (itemId: string) => void;
  /** Sends the closer to the Linked CAPA tab, the one place CAPAs are raised. */
  onManageCapas?: () => void;
}>;

/**
 * One source of truth for how a CAPA status looks, shared with the register and the CAPA
 * detail page. This used to be a local switch over a three-value union, so a CAPA that came
 * back `Pending Verification` fell through to the neutral "Planning" style.
 */
function capaBadgeStyle(status: ClosureLinkedCapaItem["status"]) {
  return capaStatusPillClass(status);
}

export function IncidentClosureStepPreventive(
  props: Readonly<IncidentClosureStepPreventiveProps>,
) {
  const { data, onChangeField, onManageCapas } = props;

  const linkedCapas = data.closureLinkedCapas ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Text as="h2" className="text-ehs-dark-bg text5 leading-normal font-bold">
        Preventive Measures & CAPAs
      </Text>

      {/* Linked CAPAs */}
      <div className="flex flex-col">
        <label className="text-ehs-muted-text text8 mb-2.5 font-bold tracking-[0.5px] uppercase">
          LINKED CAPAS
        </label>

        <div className="flex flex-col gap-3">
          {linkedCapas.length === 0 ? (
            <Text
              as="p"
              className="text-ehs-muted-text text4 rounded-3.5 border-ehs-border bg-ehs-surface border border-dashed px-4 py-3.5 font-normal"
            >
              No CAPAs are linked to this incident yet.
            </Text>
          ) : null}
          {linkedCapas.map((capa) => (
            <div
              key={capa.id}
              className="rounded-3.5 border-ehs-border hover:border-ehs-border bg-ehs-surface flex items-center justify-between border px-4 py-3.5 shadow-xs transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-ehs-light-blue/60 text-ehs-normal-blue flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Icon icon="mdi:check-circle-outline" className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Text as="span" className="text-ehs-dark-bg text4 font-bold">
                    {capa.title}
                  </Text>
                  <Text
                    as="span"
                    className="text-ehs-muted-text text4 font-normal"
                  >
                    {capa.subtitle}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-ehs-border h-1.5 w-24 overflow-hidden rounded-full">
                  <div
                    className="bg-ehs-normal-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${String(capa.progressPercent)}%` }}
                  />
                </div>
                <span
                  className={[
                    "text8 rounded-full px-2.5 py-0.5 font-bold whitespace-nowrap",
                    capaBadgeStyle(capa.status),
                  ].join(" ")}
                >
                  {capa.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/*
          A pointer to where CAPAs are actually managed, not a control of its own.
          This was a "Link additional CAPA or Action Item" button opening a picker
          whose candidate list was the already-linked set, so it could never link
          anything; the one thing it could do — untick and save — wrote to closure
          form state that `closureLinkedCapas` is not part of, so the CAPA vanished
          from the step, the draft saved 200, and the link was still there on
          reload. A control that reports success for work it did not do is worse on
          a compliance record than no control.
          A CAPA's incident is set when it is raised and the API has no way to move
          it, so raising one from the Linked CAPA tab is the whole of the real flow.
        */}
        {onManageCapas ? (
          <button
            type="button"
            onClick={onManageCapas}
            className="text-ehs-normal-blue text4 mt-3 flex items-center gap-1.5 font-bold transition-colors hover:underline"
          >
            <Icon icon="mdi:arrow-right" className="size-4" />
            <span>Manage CAPAs in the Linked CAPA tab</span>
          </button>
        ) : null}
      </div>

      {/* Notes. Still persisted as `actionsTaken` (the backend column is unchanged),
          but presented last and labelled Notes: the CAPAs listed above already are
          the action items, so a separate "actions taken" box above them invited the
          same content twice. */}
      <div className="flex flex-col">
        <label className="text-ehs-muted-text text8 mb-2 font-bold tracking-[0.5px] uppercase">
          NOTES
        </label>
        <div className="relative">
          <textarea
            value={data.actionsTaken}
            onChange={(e) => onChangeField("actionsTaken", e.target.value)}
            rows={3}
            placeholder="Add any closing notes for this incident..."
            className={FIELD_TEXTAREA_WITH_CONTROLS_CLASS}
          />
          {/*
            Rewrite only, no auto-draft — same reasoning as the root-cause step:
            there is no endpoint that invents a preventive measure, and these
            notes act on what the closer has already written.
          */}
          <AiTextAssistant
            module="incident"
            value={data.actionsTaken}
            onApply={(actionsTaken) =>
              onChangeField("actionsTaken", actionsTaken)
            }
          />
        </div>
      </div>
    </div>
  );
}
