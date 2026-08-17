"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IhSearchToolbar } from "@/components/industrial-hygiene/IhSearchToolbar";
import {
  IH_AGENT_ROWS,
  type IhAgentRow,
  type IhAgentStatus,
} from "@/components/industrial-hygiene/ih-agent-library-data";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Text } from "@/components/Text";

function AgentStatusBadge(props: Readonly<{ status: IhAgentStatus }>) {
  const isActive = props.status === "Active";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-semibold",
        isActive
          ? "bg-[rgba(8,145,166,0.12)] text-[#0891a6]"
          : "bg-[rgba(15,23,42,0.08)] text-[#8892a3]",
      ].join(" ")}
    >
      {props.status}
    </span>
  );
}

const AGENT_COLUMNS: ColumnDef<IhAgentRow, unknown>[] = [
  {
    id: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="min-w-36 py-1">
        <Text as="p" className="text-base font-semibold text-[#0b1320]">
          {row.original.name}
        </Text>
        <Text as="p" className="text-sm text-[#b3bbc8]">
          {row.original.code}
        </Text>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-[rgba(86,96,114,0.09)]">
          <Icon
            icon={row.original.typeIcon}
            className="size-4 text-[#566072]"
            aria-hidden
          />
        </span>
        <Text as="span" className="text-base text-[#566072]">
          {row.original.type}
        </Text>
      </div>
    ),
  },
  {
    id: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <Text as="span" className="text-base text-[#566072]">
        {row.original.unit}
      </Text>
    ),
  },
  {
    id: "osha",
    header: "OSHA PEL",
    cell: ({ row }) => (
      <Text as="span" className="text-base font-semibold text-[#2a3446]">
        {row.original.oshaPel}
      </Text>
    ),
  },
  {
    id: "acgih",
    header: "ACGIH TLV",
    cell: ({ row }) => (
      <Text as="span" className="text-base font-semibold text-[#2a3446]">
        {row.original.acgihTlv}
      </Text>
    ),
  },
  {
    id: "niosh",
    header: "NIOSH REL",
    cell: ({ row }) => (
      <Text as="span" className="text-base font-semibold text-[#2a3446]">
        {row.original.nioshRel}
      </Text>
    ),
  },
  {
    id: "internal",
    header: "Internal Limit",
    cell: ({ row }) => (
      <Text as="span" className="text-base font-bold text-[#0891a6]">
        {row.original.internalLimit}
      </Text>
    ),
  },
  {
    id: "sds",
    header: "SDS Link",
    cell: ({ row }) =>
      row.original.sdsLink ? (
        <button
          type="button"
          className="text-base text-[#0891a6] hover:underline"
        >
          {row.original.sdsLink}
        </button>
      ) : (
        <Text as="span" className="text-base text-[#b3bbc8]">
          —
        </Text>
      ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <AgentStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button
        type="button"
        aria-label="Edit agent"
        className="inline-flex size-7 items-center justify-center rounded-md bg-[rgba(86,96,114,0.14)] text-[#566072] transition-colors hover:bg-[rgba(86,96,114,0.22)]"
      >
        <Icon icon="mdi:pencil-outline" className="size-4" aria-hidden />
      </button>
    ),
  },
];

/** Agent Library tab — Figma 5298:28740. */
export function IhAgentLibraryView() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return IH_AGENT_ROWS;
    return IH_AGENT_ROWS.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={["Safety", "Industrial Hygiene", "Agents"]}
          title="Hazard Agent Library"
          subtitle="Master list of all monitored chemical, physical, and biological agents with OEL values"
          actions={
            <Button
              type="button"
              variant="primary"
              className="rounded-lg px-3.5 py-2 text-base! font-semibold"
            >
              <Icon icon="mdi:plus" className="size-3.5" aria-hidden />
              Add Agent
            </Button>
          }
        />

        <IhSearchToolbar
          value={query}
          onChange={setQuery}
          aria-label="Search agents"
          resultLabel={`${String(filtered.length)} chemicals`}
        />

        <Table
          data={filtered}
          columns={AGENT_COLUMNS}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
