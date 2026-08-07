"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { CapaListSkeleton } from "@/components/capa/CapaListSkeleton";
import {
  CAPA_BADGE_TONE_CLASS,
  CAPA_PRIORITY_FILTERS,
  CAPA_STATE_FILTERS,
  CAPA_TYPE_FILTERS,
  getPriorityTone,
  getStatusTone,
} from "@/components/capa/capa-list-data";
import { IncidentSegmentedControl } from "@/components/incidents";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Table } from "@/components/ui/Table";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useMyActionsQuery } from "@/hooks/use-dashboard-queries";
import { getAccessToken } from "@/lib/axios";
import {
  mapActionsToCapaRows,
  summariseCapaRows,
  type CapaListRow,
} from "@/services/mappers/capa-list.mapper";

/** No-op subscribe: the access token doesn't change during a page view. */
const subscribeToNothing = () => () => {};

function CapaBadge(props: Readonly<{ label: string; tone: string }>) {
  const { label, tone } = props;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        tone,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function CapaKpiTile(
  props: Readonly<{ label: string; value: number; icon: string; tone: string }>,
) {
  const { label, value, icon, tone } = props;

  return (
    <GlassCard className="gap-[6px]">
      <div className="flex items-center justify-between gap-3">
        <Text
          as="p"
          className="text-ehs-gray text-[11.5px] font-bold tracking-[0.23px] uppercase"
        >
          {label}
        </Text>
        <span
          className={[
            "inline-flex size-7 shrink-0 items-center justify-center rounded-full",
            tone,
          ].join(" ")}
        >
          <Icon icon={icon} className="size-4" aria-hidden="true" />
        </span>
      </div>
      <Text
        as="p"
        className="text-ehs-dark-bg text-[32px] leading-[36px] tracking-[-1px] tabular-nums"
      >
        {String(value)}
      </Text>
    </GlassCard>
  );
}

const FILTER_SHELL =
  "relative flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-3.5 rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm backdrop-blur-md sm:px-4 sm:py-3.5";

export type CapaListViewProps = Readonly<{ searchQuery?: string }>;

/**
 * CAPA register.
 *
 * Skeleton-first, in the same spirit as the Regulatory Compliance view: the
 * backend has no list-CAPAs endpoint yet (only /CAPA/Incident/{id}, /CAPA/Capa
 * and /CAPA/Drop), so this reads the closest list-shaped source —
 * GET /EHSCommandCenter/GetMyActions, the same feed behind the dashboard's
 * "My Actions" card. That endpoint currently returns an empty array, so the
 * empty state is what renders until the backend fills it in.
 */
export function CapaListView(props: Readonly<CapaListViewProps>) {
  const { searchQuery = "" } = props;

  const [state, setState] = useState<string>("All");
  const [priority, setPriority] = useState<string>("All");
  const [capaType, setCapaType] = useState<string>("All");

  // `null` until hydrated, then the real answer. Reading the token through
  // useSyncExternalStore keeps the server and first client render in agreement
  // without a setState-in-effect round trip.
  const hasToken = useSyncExternalStore(
    subscribeToNothing,
    () => Boolean(getAccessToken()),
    () => null,
  );

  const actionsQuery = useMyActionsQuery(hasToken === true);
  const rows = useMemo(
    () => mapActionsToCapaRows(actionsQuery.data?.dataModel?.actions),
    [actionsQuery.data],
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const isClosed = getStatusTone(row.status) === "closed";
      const matchesState =
        state === "All" ||
        (state === "Closed" && isClosed) ||
        (state === "Overdue" && row.dueLabel === "Overdue") ||
        (state === "Open" && !isClosed);

      const matchesPriority =
        priority === "All" ||
        row.priority.toLowerCase() === priority.toLowerCase();

      const matchesType =
        capaType === "All" ||
        row.capaType.toLowerCase().includes(capaType.toLowerCase());

      return matchesState && matchesPriority && matchesType;
    });
  }, [rows, state, priority, capaType]);

  const summary = useMemo(() => summariseCapaRows(rows), [rows]);

  const columns = useMemo<ColumnDef<CapaListRow, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: (info) => (
          <span className="text-ehs-dark-bg font-semibold">
            {String(info.getValue() ?? "—")}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Action",
        cell: (info) => (
          <span className="text-ehs-slate">
            {String(info.getValue() ?? "—")}
          </span>
        ),
      },
      { accessorKey: "capaType", header: "Type" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (info) => {
          const value = String(info.getValue() ?? "—");
          return (
            <CapaBadge
              label={value}
              tone={CAPA_BADGE_TONE_CLASS[getPriorityTone(value)]}
            />
          );
        },
      },
      { accessorKey: "owner", header: "Assigned" },
      { accessorKey: "site", header: "Site" },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const value = String(info.getValue() ?? "—");
          return (
            <CapaBadge
              label={value}
              tone={CAPA_BADGE_TONE_CLASS[getStatusTone(value)]}
            />
          );
        },
      },
      {
        accessorKey: "dueLabel",
        header: "Due",
        cell: (info) => {
          const value = String(info.getValue() ?? "—");
          return (
            <span
              className={
                value === "Overdue"
                  ? "text-ehs-red font-semibold"
                  : "text-ehs-gray"
              }
            >
              {value}
            </span>
          );
        },
      },
    ],
    [],
  );

  // `hasToken === null` means we haven't hydrated yet, so the skeleton also
  // covers the first paint on a hard refresh — not just the fetch.
  const showSkeleton =
    hasToken === null || (hasToken && actionsQuery.isLoading);
  const showSignInPrompt = hasToken === false;
  const showError = hasToken === true && actionsQuery.isError;

  if (showSkeleton) {
    return <CapaListSkeleton />;
  }

  if (showSignInPrompt) {
    return (
      <GlassCard className="min-h-[240px] items-center justify-center">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Please sign in to load CAPAs.
        </Text>
      </GlassCard>
    );
  }

  if (showError) {
    return (
      <GlassCard className="min-h-[240px] items-center justify-center gap-2 text-center">
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text-ehs-darker text-sm font-semibold">
          Could not load CAPAs
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm">
          {getMutationErrorMessage(actionsQuery.error, "Failed to load CAPAs.")}
        </Text>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void actionsQuery.refetch()}
          className="mt-1"
        >
          Retry
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-[14px]">
      <div className="grid gap-[14px] sm:grid-cols-2 xl:grid-cols-4">
        <CapaKpiTile
          label="Total CAPAs"
          value={summary.total}
          icon="mdi:clipboard-check-outline"
          tone="bg-ehs-normal-blue/[0.12] text-ehs-dark-blue"
        />
        <CapaKpiTile
          label="Open"
          value={summary.open}
          icon="mdi:progress-clock"
          tone="bg-ehs-yellow/[0.14] text-ehs-yellow"
        />
        <CapaKpiTile
          label="Overdue"
          value={summary.overdue}
          icon="mdi:alert-outline"
          tone="bg-ehs-red/[0.12] text-ehs-red"
        />
        <CapaKpiTile
          label="Closed"
          value={summary.closed}
          icon="mdi:check-circle-outline"
          tone="bg-ehs-green/[0.14] text-ehs-green"
        />
      </div>

      <div className={FILTER_SHELL}>
        <span className="border-ehs-border/80 text-ehs-darker inline-flex h-8 w-fit shrink-0 items-center gap-1.5 rounded-lg border bg-white/80 px-2.5 text-xs font-bold shadow-xs">
          <Icon icon="mdi:filter-variant" className="size-3.5" aria-hidden />
          Filters
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3">
          <IncidentSegmentedControl
            label="State"
            options={CAPA_STATE_FILTERS}
            value={state}
            onChange={setState}
            className="min-w-fit flex-1"
          />
          <IncidentSegmentedControl
            label="Priority"
            options={CAPA_PRIORITY_FILTERS}
            value={priority}
            onChange={setPriority}
            className="min-w-fit flex-1"
          />
          <IncidentSegmentedControl
            label="Type"
            options={CAPA_TYPE_FILTERS}
            value={capaType}
            onChange={setCapaType}
            className="min-w-fit flex-1"
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <GlassCard className="min-h-[240px] items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:clipboard-text-off-outline"
            className="text-ehs-muted-text size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            {rows.length === 0
              ? "No CAPAs yet"
              : "No CAPAs match these filters"}
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-sm text-sm">
            {rows.length === 0
              ? "Corrective and preventive actions raised from incidents will appear here."
              : "Try widening the state, priority or type filter."}
          </Text>
        </GlassCard>
      ) : (
        <Table
          data={filteredRows}
          columns={columns}
          globalFilter={searchQuery}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
}
