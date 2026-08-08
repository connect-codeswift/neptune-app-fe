"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

export type NearMissDetailPanelProps = Readonly<{
  record: NearMissRecord | null;
  onClose?: () => void;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text
        as="p"
        className="text-ehs-muted-text text-xs font-semibold tracking-wide uppercase"
      >
        {label}
      </Text>
      <Text as="p" className="text-ehs-darker text-sm font-normal">
        {value}
      </Text>
    </div>
  );
}

export function NearMissDetailPanel(props: Readonly<NearMissDetailPanelProps>) {
  const { record, onClose, className = "" } = props;

  if (!record) {
    return (
      <IncidentGlassCard
        className={[
          "border-ehs-border min-h-60 min-w-0 border bg-[#fafafa]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text-ehs-muted-text text-sm">
          Select a near miss record to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  let statusTone: "neutral" | "teal" | "muted" | "danger" | "warn" = "neutral";
  if (record.status === "Open") statusTone = "neutral";
  else if (record.status === "Investigating") statusTone = "warn";
  else if (record.status === "Closed") statusTone = "muted";

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={[
        "border-ehs-border flex min-w-0 flex-col border bg-[#fafafa]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-ehs-border border-b px-5 py-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Text
              as="span"
              className="text-ehs-muted-text text-xs font-semibold"
            >
              {record.id}
            </Text>
            <IncidentBadge label={record.status} tone={statusTone} showDot />
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="text-ehs-muted-text hover:text-ehs-gray inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors"
            >
              <Icon icon="mdi:close" className="text-lg" aria-hidden="true" />
            </button>
          )}
        </div>

        <Text
          as="h2"
          className="text-ehs-darker text-lg leading-snug font-bold"
        >
          {record.title}
        </Text>
        <Text as="p" className="text-ehs-muted-text mt-2 text-xs">
          {`Near Miss · ${record.site}`}
        </Text>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-4">
        <MetaField label="Reported" value={record.age + " ago"} />
        <MetaField label="Reporter" value={record.reporter} />
        <MetaField label="Hazard Type" value={record.hazardType} />
        <MetaField label="Site" value={record.site} />
      </div>

      <div className="border-ehs-border border-b px-5 py-4">
        <Text
          as="p"
          className="text-ehs-muted-text mb-2 text-xs font-semibold tracking-wide uppercase"
        >
          Description
        </Text>
        <Text as="p" className="text-ehs-gray text-xs leading-relaxed">
          {record.description}
        </Text>
      </div>

      <div className="flex-1 px-5 py-4">
        <div className="border-ehs-border rounded-xl border bg-white/70 px-4 py-3.5 shadow-sm">
          <div className="text-ehs-normal-blue flex items-center gap-2">
            <Icon icon="mdi:information-outline" className="text-lg" />
            <Text
              as="span"
              className="text-xs font-semibold tracking-wide uppercase"
            >
              Action Required
            </Text>
          </div>
          <Text as="p" className="text-ehs-gray mt-2 text-xs leading-relaxed">
            Please investigate this near miss to determine if a full CAPA
            (Corrective and Preventive Action) plan needs to be initiated.
          </Text>
        </div>
      </div>

      {/* Both actions are disabled: neither ever had an onClick, so they looked
          operable and silently did nothing. "Mark Investigated" needs a
          near-miss status mutation and "Add CAPA" needs the CAPA create flow
          wired through to this panel. */}
      <div className="border-ehs-border flex min-w-0 flex-col gap-2 border-t px-4 py-4">
        <div className="flex min-w-0 flex-nowrap items-center gap-2">
          <Button
            type="button"
            variant="primary"
            disabled
            title="Marking a near miss as investigated is not available yet"
            className="min-w-0 flex-1 justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon
              icon="mdi:check-circle-outline"
              className="shrink-0 text-base"
              aria-hidden="true"
            />
            <span className="truncate">Mark Investigated</span>
          </Button>
          <Button
            type="button"
            variant="tertiary"
            disabled
            title="Adding a CAPA from this panel is not available yet"
            className="min-w-0 flex-1 justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon
              icon="mdi:plus"
              className="shrink-0 text-base"
              aria-hidden="true"
            />
            <span className="truncate">Add CAPA</span>
          </Button>
        </div>
        <Text as="p" className="text-ehs-muted-text text-center text-[11px]">
          These actions aren&apos;t available yet. Open the near miss to close
          or convert it.
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
