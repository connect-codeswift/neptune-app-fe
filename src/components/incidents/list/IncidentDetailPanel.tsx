"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  IncidentBadge,
  severityTone,
  stateTone,
} from "@/components/incidents/list/IncidentBadge";
import { AddCapaModal } from "@/components/incidents/shared/capa/AddCapaModal";
import type { IncidentRecord } from "@/components/incidents/list/incident-list-types";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { useCapasByIncidentQuery } from "@/hooks/use-capa-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { toast } from "@/lib/toast";
import { mapCapaItemsToIncidentCapas } from "@/services/mappers/capa.mapper";

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
        className="text-ehs-muted-text text-sm font-semibold tracking-wide uppercase"
      >
        {label}
      </Text>
      <Text as="p" className="text-ehs-darker text-sm">
        {value}
      </Text>
    </div>
  );
}

export function IncidentDetailPanel(props: Readonly<IncidentDetailPanelProps>) {
  const {
    incident,
    className = "",
  } = props;
  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);
  const createCapaMutation = useCreateCapaMutation();
  const accessTokenState = useHasAccessToken();
  const hasToken = accessTokenState === true;

  const capaQuery = useCapasByIncidentQuery({
    incidentId: incident?.numericId ?? null,
    enabled: hasToken && (incident?.numericId ?? 0) > 0,
  });

  const capas = useMemo(
    () => mapCapaItemsToIncidentCapas(capaQuery.data?.items ?? []),
    [capaQuery.data?.items],
  );

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

  const handleSubmitCapa = async (
    payload: Readonly<{
      controlLevel: string;
      description: string;
      type: string;
      owner: string;
      dueDate: string;
      priority: string;
    }>,
  ) => {
    try {
      await createCapaMutation.mutateAsync({
        incidentId: incident.numericId,
        controlLevel: payload.controlLevel,
        description: payload.description,
        type: payload.type,
        owner: payload.owner,
        dueDate: payload.dueDate,
        priority: payload.priority,
      });
      toast.success(
        "CAPA created",
        `Added ${payload.type.toLowerCase()} action for ${incident.id}.`,
      );
    } catch (error) {
      toast.error(
        "Could not create CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
      throw error;
    }
  };

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
              className="text-ehs-muted-text text-sm font-semibold"
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
          </div>

          {incident.numericId > 0 ? (
            <Link
              href={`/dashboard/incidents/${String(incident.numericId)}`}
              className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold transition-colors"
            >
              Open details
              <Icon
                icon="mdi:arrow-right"
                className="size-3.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="border-ehs-border text-ehs-normal-blue inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold opacity-50"
            >
              Open details
              <Icon
                icon="mdi:arrow-right"
                className="size-3.5"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <Text as="h2" className="text-ehs-darker text-lg font-bold">
          {incident.title}
        </Text>
        <Text
          as="p"
          className="text-ehs-muted-text mt-2 text-sm leading-[13px]"
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
          className="text-ehs-muted-text mb-2 text-sm font-semibold tracking-wide uppercase"
        >
          Summary
        </Text>
        <Text as="p" className="text-ehs-gray text-sm leading-[18px]">
          {incident.summary}
        </Text>
      </div>

      <div className="border-ehs-border border-b px-5 py-3.5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Text
            as="p"
            className="text-ehs-muted-text text-sm font-semibold tracking-wide uppercase"
          >
            {capaQuery.isPending
              ? "Corrective actions · …"
              : `Corrective actions · ${String(capas.length)}`}
          </Text>
          <button
            type="button"
            onClick={() => setIsAddCapaOpen(true)}
            disabled={incident.numericId <= 0}
            className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon="mdi:plus" className="text-sm" aria-hidden="true" />
            Add CAPA
          </button>
        </div>

        {capaQuery.isPending ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading linked CAPAs…
          </Text>
        ) : capaQuery.isError ? (
          <Text as="p" className="text-ehs-red text-sm">
            Could not load linked CAPAs.
          </Text>
        ) : capas.length === 0 ? (
          <Text as="p" className="text-ehs-muted-text text-sm">
            No linked CAPAs yet.
          </Text>
        ) : (
          <div className="flex flex-col gap-2.5">
            {capas.map((capa) => (
              <div
                key={capa.id}
                className="border-ehs-border rounded-xl border bg-white/70 px-3.5 py-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Text
                    as="span"
                    className="text-ehs-muted-text text-sm font-semibold"
                  >
                    {capa.id}
                  </Text>
                  <IncidentBadge label={capa.hierarchy} tone="neutral" showDot />
                  <IncidentBadge label={capa.status} tone="muted" />
                  <IncidentBadge label={capa.priority} tone="neutral" />
                </div>
                <Text as="p" className="text-ehs-darker text-sm leading-[17px]">
                  {capa.description}
                </Text>
                <div className="text-ehs-muted-text mt-2 flex flex-wrap items-center gap-3 text-sm">
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
            ))}
          </div>
        )}
      </div>

      {isAddCapaOpen ? (
        <AddCapaModal
          incidentId={incident.id}
          incidentTitle={incident.title}
          isSubmitting={createCapaMutation.isPending}
          onClose={() => setIsAddCapaOpen(false)}
          onSubmit={handleSubmitCapa}
        />
      ) : null}
    </IncidentGlassCard>
  );
}
