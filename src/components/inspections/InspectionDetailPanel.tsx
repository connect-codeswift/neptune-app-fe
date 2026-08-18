"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import type {
  InspectionDetail,
  InspectionRecord,
} from "@/app/dashboard/inspections/inspections-data";

type Segment = Readonly<{ label: string; value: number; color: string }>;

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Ring chart of the inspection's item breakdown, with the total in the middle. */
function ItemsDonut(props: Readonly<{ segments: readonly Segment[] }>) {
  const { segments } = props;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const arcs = segments.reduce<
    { label: string; color: string; length: number; offset: number }[]
  >((acc, segment) => {
    const previous = acc.at(-1);
    const length = total > 0 ? (segment.value / total) * CIRCUMFERENCE : 0;

    acc.push({
      label: segment.label,
      color: segment.color,
      length,
      offset: previous ? previous.offset + previous.length : 0,
    });
    return acc;
  }, []);

  return (
    <div className="relative size-32 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth="15"
            strokeDasharray={`${String(arc.length)} ${String(CIRCUMFERENCE - arc.length)}`}
            strokeDashoffset={-arc.offset}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text
          as="span"
          className="text2 text-ehs-darker leading-none tabular-nums"
        >
          {String(total)}
        </Text>
        <Text as="span" className="text9 text-ehs-muted-text mt-1">
          Items
        </Text>
      </div>
    </div>
  );
}

export type InspectionDetailPanelProps = Readonly<{
  /** List-row fields when the panel opens before detail summary loads. */
  record?: InspectionRecord | null;
  detail?: InspectionDetail | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}>;

export function InspectionDetailPanel(props: InspectionDetailPanelProps) {
  const {
    record = null,
    detail = null,
    isLoading = false,
    errorMessage = null,
    onRetry,
    className = "",
  } = props;

  if (!record && !detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          Select an inspection to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  if (isLoading && !detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-7 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          Loading inspection details…
        </Text>
      </IncidentGlassCard>
    );
  }

  if (errorMessage && !detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-darker">
          Could not load details
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text text-center">
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            className="mt-1"
          >
            Retry
          </Button>
        ) : null}
      </IncidentGlassCard>
    );
  }

  const id = detail?.id ?? record?.id ?? "";
  const title = detail?.title ?? record?.title ?? "Inspection";
  const displayCode = detail?.code ?? (id ? `I-${id}` : "—");
  const progress = detail?.progress ?? record?.progress ?? 0;
  const findingsHref = `/dashboard/inspections/findings/${encodeURIComponent(id)}`;

  const segments: readonly Segment[] = detail
    ? [
        { label: "Pass", value: detail.items.pass, color: "var(--ehs-green)" },
        {
          label: "Action",
          value: detail.items.action,
          color: "var(--ehs-yellow)",
        },
        {
          label: "Critical",
          value: detail.items.critical,
          color: "var(--ehs-red)",
        },
        {
          label: "Pending",
          value: detail.items.pending,
          color: "var(--ehs-muted-text)",
        },
      ]
    : [];

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-4.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {displayCode}
          </Text>

          <Link
            href={findingsHref}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text5 inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {title}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text mt-1">
          {`${String(progress)}% complete${record?.status ? ` · ${record.status}` : ""}`}
        </Text>
      </div>

      {detail && segments.length > 0 ? (
        <div className="border-ehs-border flex items-center gap-5 border-b px-5 py-4">
          <ItemsDonut segments={segments} />

          <ul className="flex min-w-0 flex-1 flex-col gap-3">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <Text
                  as="span"
                  className="text4 text-ehs-darker min-w-0 flex-1 truncate"
                >
                  {segment.label}
                </Text>
                <Text as="span" className="text4 text-ehs-darker tabular-nums">
                  {String(segment.value)}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail && detail.topFindings.length > 0 ? (
        <div className="px-5 py-3.5">
          <Text as="p" className="text9 text-ehs-muted-text mb-2">
            Top findings
          </Text>
          <ul className="flex flex-col">
            {detail.topFindings.map((finding) => (
              <li
                key={finding}
                className="border-ehs-border flex items-center gap-2.5 border-t py-2.5 first:border-t-0 first:pt-0"
              >
                <span
                  className="bg-ehs-muted-text size-1.5 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <Text
                  as="span"
                  className="text4 text-ehs-darker min-w-0 flex-1"
                >
                  {finding}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {record && !detail ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-3.5">
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="p" className="text9 text-ehs-muted-text">
              Site
            </Text>
            <Text as="p" className="text4 text-ehs-darker">
              {record.site}
            </Text>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="p" className="text9 text-ehs-muted-text">
              Inspector
            </Text>
            <Text as="p" className="text4 text-ehs-darker">
              {record.inspector}
            </Text>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="p" className="text9 text-ehs-muted-text">
              Due
            </Text>
            <Text as="p" className="text4 text-ehs-darker">
              {record.dueDate}
            </Text>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Text as="p" className="text9 text-ehs-muted-text">
              Findings
            </Text>
            <Text as="p" className="text4 text-ehs-darker">
              {record.findings ?? "—"}
            </Text>
          </div>
        </div>
      ) : null}
    </IncidentGlassCard>
  );
}
