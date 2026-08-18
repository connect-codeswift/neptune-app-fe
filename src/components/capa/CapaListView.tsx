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
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { Table } from "@/components/ui/Table";
import {
  TABLE_HEADER_ACTION_CLASS,
  TABLE_HEADER_ACTION_ICON_CLASS,
} from "@/components/ui/table-header-action";
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
        "text-2.75 inline-flex items-center rounded-full px-2 py-0.5 font-semibold whitespace-nowrap",
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
    <GlassCard className="gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Text
          as="p"
          className="text-ehs-gray text-[12px] font-bold tracking-[0.23px] uppercase"
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
        className="text-ehs-dark-bg text-8 leading-9 tracking-[-1px] tabular-nums"
      >
        {String(value)}
      </Text>
    </GlassCard>
  );
}

function CreateCapaButton(
  props: Readonly<{ className?: string; onClick?: () => void }>,
) {
  const { className = "", onClick } = props;

  return (
    <Button
      type="button"
      variant="primary"
      onClick={onClick}
      className={[TABLE_HEADER_ACTION_CLASS, className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:plus"
        className={TABLE_HEADER_ACTION_ICON_CLASS}
        aria-hidden="true"
      />
      Create CAPA
    </Button>
  );
}

export type CapaListViewProps = Readonly<{
  className?: string;
}>;

/**
 * CAPA register.
 *
 * Skeleton-first, in the same spirit as the Regulatory Compliance view: the
 * backend has no list-CAPAs endpoint yet (only /CAPA/Incident/{id}, /CAPA/Capa
 * and /CAPA/Drop), so this reads the closest list-shaped source —
 * GET /api/v1/command-center/my-actions, the same feed behind the dashboard's
 * "My Actions" card. That endpoint currently returns an empty array, so the
 * empty state is what renders until the backend fills it in.
 */
export function CapaListView(props: Readonly<CapaListViewProps>) {
  const { className = "" } = props;

  const [state, setState] = useState<string>("All");
  const [priority, setPriority] = useState<string>("All");
  const [capaType, setCapaType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    const needle = searchQuery.trim().toLowerCase();

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

      const matchesSearch =
        needle === "" ||
        [row.code, row.title, row.owner, row.site, row.status, row.capaType]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      return matchesState && matchesPriority && matchesType && matchesSearch;
    });
  }, [rows, state, priority, capaType, searchQuery]);

  const resultLabel = `${String(filteredRows.length)} ${
    filteredRows.length === 1 ? "CAPA" : "CAPAs"
  }`;
  const summary = useMemo(() => summariseCapaRows(rows), [rows]);

  const columns = useMemo<ColumnDef<CapaListRow, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: "ID",
        cell: (info) => (
          <span className="text-ehs-muted-text whitespace-nowrap">
            {String(info.getValue() ?? "—")}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Action",
        cell: (info) => (
          <span className="text-ehs-slate truncate">
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
      <GlassCard className="min-h-60 items-center justify-center">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Please sign in to load CAPAs.
        </Text>
      </GlassCard>
    );
  }

  if (showError) {
    return (
      <GlassCard className="min-h-60 items-center justify-center gap-2 text-center">
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
    <div
      className={["flex min-w-0 flex-col gap-3.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
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

      <ModuleFilterBar
        segments={[
          {
            label: "State",
            options: CAPA_STATE_FILTERS,
            value: state,
            onChange: setState,
          },
          {
            label: "Priority",
            options: CAPA_PRIORITY_FILTERS,
            value: priority,
            onChange: setPriority,
          },
          {
            label: "Type",
            options: CAPA_TYPE_FILTERS,
            value: capaType,
            onChange: setCapaType,
          },
        ]}
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by code, action, owner, site..."
        aria-label="Search CAPAs"
        resultLabel={resultLabel}
      />

      {filteredRows.length === 0 ? (
        <GlassCard className="min-h-60 items-center justify-center gap-2 text-center">
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
              : "Try widening the state, priority, type, or search."}
          </Text>
          {rows.length === 0 ? <CreateCapaButton className="mt-2" /> : null}
        </GlassCard>
      ) : (
        <Table
          data={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          header={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Text
                as="h3"
                className="text-ehs-darker shrink-0 text-base font-bold"
              >
                CAPAs
              </Text>
              <CreateCapaButton />
            </div>
          }
        />
      )}
    </div>
  );
}
