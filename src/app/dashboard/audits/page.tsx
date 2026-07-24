"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuditDetailQuery, useAuditsQuery } from "@/hooks/use-audit-queries";
import {
  mapAuditDetailDtoToDetail,
  mapAuditDtoToRecord,
} from "@/lib/map-audit";
import {
  StatMetricCard,
  type StatMetricCardProps,
} from "@/components/StatMetricCard";
import { Table } from "@/components/ui/Table";
import { auditColumns } from "@/components/audits/AuditColumns";
import { AuditDetailPanel } from "@/components/audits/AuditDetailPanel";
import { AuditRegisterToolbar } from "@/components/audits/AuditRegisterToolbar";

const AUDIT_METRICS: readonly StatMetricCardProps[] = [
  {
    title: "Audits YTD",
    value: 29,
    trendValue: "+5",
    trendTone: "positive",
  },
  {
    title: "Open findings",
    value: 19,
    trendValue: "-4",
    trendTone: "negative",
  },
  {
    title: "On-time closure",
    value: "92%",
    trendValue: "+2pp",
    trendTone: "positive",
  },
  {
    title: "Avg findings/audit",
    value: "2.1",
    trendValue: "-0.3",
    trendTone: "negative",
  },
];

export default function AuditsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const auditsQuery = useAuditsQuery({ pageNumber: 1, pageSize: 10 });
  console.log(auditsQuery.data?.dataModel.data);
  const records = useMemo(
    () => (auditsQuery.data?.dataModel.data ?? []).map(mapAuditDtoToRecord),
    [auditsQuery.data],
  );

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          selectedStatus === "All" || record.status === selectedStatus,
      ),
    [records, selectedStatus],
  );

  // Fetch the clicked audit's detail (GET /api/Audit/{id}) for the side panel.
  const detailQuery = useAuditDetailQuery(selectedId);
  const detailDto = detailQuery.data?.dataModel ?? null;
  const detail = useMemo(
    () => (detailDto ? mapAuditDetailDtoToDetail(detailDto) : null),
    [detailDto],
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader
        title="Audits"
        searchPlaceholder="Search incidents, actions, docs..."
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        actionLabel="Start Audit"
        onActionClick={() => router.push("/dashboard/audits/start")}
      />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {/* KPI Metrics */}
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {AUDIT_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {auditsQuery.isPending ? (
          <p className="text-ehs-muted-text text-sm">Loading audits...</p>
        ) : auditsQuery.isError ? (
          <p className="text-ehs-red text-sm">Could not load audits.</p>
        ) : null}

        {/* Audit register + selected audit breakdown */}
        <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Table
            data={filteredRecords}
            columns={auditColumns}
            selectedRowId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            getRowId={(row) => row.id}
            containerClassName="min-w-0"
            header={
              <AuditRegisterToolbar
                status={selectedStatus}
                onStatusChange={setSelectedStatus}
                onTemplatesClick={() =>
                  router.push("/dashboard/audits/template")
                }
              />
            }
          />

          {selectedId !== null ? (
            detailQuery.isPending ? (
              <p className="text-ehs-muted-text text-sm">Loading detail...</p>
            ) : detailQuery.isError ? (
              <p className="text-ehs-red text-sm">
                Could not load audit detail.
              </p>
            ) : detail ? (
              <AuditDetailPanel detail={detail} className="min-w-0" />
            ) : null
          ) : null}
        </div>
      </div>
    </div>
  );
}
