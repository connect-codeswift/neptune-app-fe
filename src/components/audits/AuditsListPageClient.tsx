"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { withManageAction } from "@/components/ui/table-manage-column";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { MetricCardsRow } from "@/components/ui/MetricCard";
import { SkeletonTable } from "@/components/ui/skeletons";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import { createAuditColumns } from "@/components/audits/AuditColumns";
import { AuditDetailPanel } from "@/components/audits/AuditDetailPanel";
import { AuditPageSkeleton } from "@/components/audits/AuditPageSkeleton";
import { AuditsRegisterHeader } from "@/components/audits/AuditsRegisterHeader";
import {
  useAuditDetailSummaryQuery,
  useAuditsQuery,
  useAuditSummaryQuery,
} from "@/hooks/use-audit-queries";
import { mapAuditDtoToRecord } from "@/lib/map-audit";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  mapAuditDetailSummaryToDetail,
  mapSummaryToMetrics,
} from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { getCurrentUser } from "@/lib/current-user";

const PAGE_SIZE = 10;

export function AuditsListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<RegisterStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { userId } = getCurrentUser();
  const summaryQuery = useAuditSummaryQuery(userId);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status: toApiStatusFilter(selectedStatus),
    }),
    [pageNumber, selectedStatus],
  );

  const auditsQuery = useAuditsQuery(listParams);

  const page = auditsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapAuditDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const haystack = [
        record.id,
        formatRecordDisplayId("A", record.id),
        record.title,
        record.scope,
        record.site,
        record.auditor,
        record.status,
        record.dueDate,
        record.findings ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery]);

  const selectedRecord =
    selectedId == null
      ? null
      : (filteredRecords.find((record) => record.id === selectedId) ??
        records.find((record) => record.id === selectedId) ??
        null);

  /** Drop stale selection when the row left the current page/filter. */
  const activeSelectedId = selectedRecord?.id ?? null;

  const detailSummaryQuery = useAuditDetailSummaryQuery(activeSelectedId);
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapAuditDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "audit"),
    [summaryQuery.data],
  );

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedRecord != null;

  const columns = useMemo(
    () =>
      withManageAction(
        createAuditColumns({
          selectedId: activeSelectedId,
          onViewMore: handleToggleDetailPanel,
          expanded: !isPanelOpen,
        }),
        {
          getHref: (row) =>
            `/dashboard/audits/findings/${encodeURIComponent(row.id)}`,
          getAriaLabel: (row) => `Manage audit ${row.title}`,
        },
      ),
    [activeSelectedId, handleToggleDetailPanel, isPanelOpen],
  );

  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "audit" : "audits"
  }`;

  const panelErrorMessage =
    isPanelOpen && detailSummaryQuery.isError
      ? detailSummaryErrorMessage(detailSummaryQuery.error)
      : null;

  const showListLoading = auditsQuery.isPending && !auditsQuery.data;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Audits" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {summaryQuery.isPending ? (
          <AuditPageSkeleton />
        ) : (
          <>
            <MetricCardsRow metrics={metrics} />

            {summaryQuery.isError ? (
              <Text as="p" className="text4 text-ehs-red">
                Could not load audit KPIs.
              </Text>
            ) : null}
          </>
        )}

        <ModuleFilterBar
          segments={[
            {
              label: "Status",
              options: REGISTER_STATUS_FILTERS,
              value: selectedStatus,
              onChange: (value) => {
                setSelectedStatus(value as RegisterStatusFilter);
                setPageNumber(1);
                setSelectedId(null);
              },
            },
          ]}
        />

        <ModuleSearchBar
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value);
            setSelectedId(null);
          }}
          placeholder="Search by title, site, auditor..."
          aria-label="Search audits"
          resultLabel={resultLabel}
        />

        {auditsQuery.isError ? (
          <IncidentGlassCard
            className="min-h-45 text-center"
            incidentGlassCardClassName="items-center justify-center gap-2"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text4 text-ehs-darker">
              Could not load audits
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void auditsQuery.refetch()}
              className="mt-1"
            >
              Retry
            </Button>
          </IncidentGlassCard>
        ) : null}

        {showListLoading ? <SkeletonTable rows={8} columns={6} /> : null}

        {!showListLoading && !auditsQuery.isError ? (
          <div
            className={[
              "grid min-w-0 items-start gap-x-3.5 gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                : "xl:grid-cols-1",
            ].join(" ")}
          >
            <Table
              variant="compliance"
              data={filteredRecords}
              columns={columns}
              selectedRowId={activeSelectedId}
              getRowId={(row) => row.id}
              containerClassName={[complianceGlassCardClass, "min-w-0"].join(
                " ",
              )}
              header={
                <AuditsRegisterHeader
                  auditCount={page?.totalRecords ?? 0}
                  onTemplates={() => {
                    router.push("/dashboard/audits/template");
                  }}
                  onScheduleAudit={() => {
                    router.push("/dashboard/audits/start");
                  }}
                />
              }
              pagination={{
                pageNumber,
                pageSize: PAGE_SIZE,
                totalRecords: page?.totalRecords ?? 0,
                onPageChange: (nextPage) => {
                  setPageNumber(nextPage);
                  setSelectedId(null);
                },
                isLoading: auditsQuery.isFetching,
              }}
            />

            {isPanelOpen ? (
              <AuditDetailPanel
                record={selectedRecord}
                detail={detail}
                isLoading={detailSummaryQuery.isLoading}
                errorMessage={panelErrorMessage}
                onRetry={() => {
                  void detailSummaryQuery.refetch();
                }}
                className="min-w-0 xl:sticky xl:top-4"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
