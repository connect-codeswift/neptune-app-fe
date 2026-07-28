"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
// import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  severityTone,
  stageTone,
  stateTone,
} from "@/components/incidents/list/IncidentBadge";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";

export type IncidentDetailPanelProps = Readonly<{
  incident: IncidentRecord | null;
  /** Sets the incident status to Closed (does not dismiss the sidebar). */
  onCloseIncident?: () => void;
  isClosingIncident?: boolean;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text
        as="p"
        className="text-ehs-muted-text text-[11px] font-semibold tracking-wide uppercase"
      >
        {label}
      </Text>
      <Text as="p" className="text-ehs-darker text-[13px]">
        {value}
      </Text>
    </div>
  );
}

export function IncidentDetailPanel(props: Readonly<IncidentDetailPanelProps>) {
  const {
    incident,
    // onCloseIncident,
    // isClosingIncident = false,
    className = "",
  } = props;
  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);

  if (!incident) {
    return (
      <IncidentGlassCard
        className={[
          "min-h-[240px] min-w-0 items-center justify-center",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Text as="p" className="text-ehs-muted-text text-sm">
          Select an incident to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-[18px] pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Text
              as="span"
              className="text-ehs-muted-text text-[12px] font-semibold"
            >
              {incident.id}
            </Text>
            <IncidentBadge
              label={incident.severity}
              tone={severityTone(incident.severity)}
              showDot
            />
            <IncidentBadge
              label={incident.state}
              tone={stateTone(incident.state)}
              showDot
            />
            <IncidentBadge
              label={incident.stage}
              tone={stageTone(incident.stage)}
            />
          </div>

          <button
            type="button"
            aria-label="More actions"
            className="text-ehs-muted-text hover:text-ehs-gray inline-flex size-6 items-center justify-center rounded-md"
          >
            <Icon
              icon="mdi:dots-horizontal"
              className="text-lg"
              aria-hidden="true"
            />
          </button>
        </div>

        <Text
          as="h2"
          className="text-ehs-darker text-[18px] leading-[21px] font-bold"
        >
          {incident.title}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text mt-2 text-[12px] leading-[13px]"
        >
          {incident.site}
        </Text>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-3.5">
        <MetaField label="Reported" value={incident.reportedAt} />
        <MetaField label="Reporter" value={incident.reporter} />
        <MetaField label="Assignee" value={incident.assignee} />
        <MetaField label="Injury" value={incident.injury} />
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <Text
          as="p"
          className="text-ehs-muted-text mb-2 text-[11px] font-semibold tracking-wide uppercase"
        >
          Summary
        </Text>
        <Text as="p" className="text-ehs-gray text-[12px] leading-[18px]">
          {incident.summary}
        </Text>
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Text
            as="p"
            className="text-ehs-muted-text text-[11px] font-semibold tracking-wide uppercase"
          >
            {`Corrective actions · ${String(incident.capas.length)}`}
          </Text>
          <button
            type="button"
            onClick={() => setIsAddCapaOpen(true)}
            className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-[12px] font-semibold"
          >
            <Icon icon="mdi:plus" className="text-sm" aria-hidden="true" />
            Add CAPA
          </button>
        </div>

        {incident.capas.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-[12px]">
            No linked CAPAs yet.
          </Text>
        ) : (
          incident.capas.map((capa) => (
            <div
              key={capa.id}
              className="border-ehs-border rounded-xl border bg-white/70 px-3.5 py-3"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Text
                  as="span"
                  className="text-ehs-muted-text text-[11px] font-semibold"
                >
                  {capa.id}
                </Text>
                <IncidentBadge label={capa.hierarchy} tone="neutral" showDot />
                <IncidentBadge label={capa.status} tone="muted" />
                <IncidentBadge label={capa.priority} tone="neutral" />
              </div>
              <Text
                as="p"
                className="text-ehs-darker text-[12px] leading-[17px]"
              >
                {capa.description}
              </Text>
              <div className="text-ehs-muted-text mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Icon
                    icon="mdi:account-outline"
                    className="text-xs"
                    aria-hidden="true"
                  />
                  {capa.assignee}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon
                    icon="mdi:calendar-outline"
                    className="text-xs"
                    aria-hidden="true"
                  />
                  {capa.dueDate}
                </span>
                <span>· {capa.type}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Temporarily hidden — Close Incident / Open HRCA / Add CAPA
      <div className="border-ehs-border flex min-w-0 flex-nowrap items-center gap-1.5 border-t px-3 py-3 sm:gap-2 sm:px-5">
        <Button
          type="button"
          variant="primary"
          onClick={onCloseIncident}
          disabled={
            isClosingIncident ||
            incident.state === "Closed" ||
            incident.stage === "Closed"
          }
          className="min-w-0 flex-1 justify-center gap-1 rounded-lg px-2 py-2 text-[12px] whitespace-nowrap disabled:opacity-50 sm:px-3 sm:text-[13px]"
        >
          <Icon
            icon={
              incident.state === "Closed" || incident.stage === "Closed"
                ? "mdi:lock-check-outline"
                : "mdi:check"
            }
            className="size-3.5 shrink-0 sm:size-4"
            aria-hidden="true"
          />
          <span className="truncate">
            {isClosingIncident
              ? "Closing…"
              : incident.state === "Closed" || incident.stage === "Closed"
                ? "Closed"
                : "Close incident"}
          </span>
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="min-w-0 flex-1 justify-center gap-1 rounded-lg px-2 py-2 text-[12px] whitespace-nowrap sm:px-3 sm:text-[13px]"
        >
          <Icon
            icon="mdi:cog-outline"
            className="size-3.5 shrink-0 sm:size-4"
            aria-hidden="true"
          />
          <span className="truncate">Open HRCA</span>
        </Button>
        <Button
          type="button"
          variant="tertiary"
          onClick={() => setIsAddCapaOpen(true)}
          className="min-w-0 flex-1 justify-center gap-1 rounded-lg px-2 py-2 text-[12px] whitespace-nowrap sm:px-3 sm:text-[13px]"
        >
          <Icon
            icon="mdi:plus"
            className="size-3.5 shrink-0 sm:size-4"
            aria-hidden="true"
          />
          <span className="truncate">Add CAPA</span>
        </Button>
      </div>
      
*/}
      {isAddCapaOpen ? (
        <AddCapaModal
          incidentId={incident.id}
          incidentTitle={incident.title}
          onClose={() => setIsAddCapaOpen(false)}
        />
      ) : null}
    </IncidentGlassCard>
  );
}
