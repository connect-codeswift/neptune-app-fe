"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { withRowLink } from "@/components/ui/table-row-link";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { MetricCardsRow } from "@/components/ui/MetricCard";
import { SkeletonTable } from "@/components/ui/skeletons";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import { createInspectionColumns } from "@/components/inspections/InspectionColumns";
import { InspectionDetailPanel } from "@/components/inspections/InspectionDetailPanel";
import { InspectionPageSkeleton } from "@/components/inspections/InspectionPageSkeleton";
import { InspectionsRegisterHeader } from "@/components/inspections/InspectionsRegisterHeader";
import {
  useInspectionDetailSummaryQuery,
  useInspectionsQuery,
  useInspectionSummaryQuery,
} from "@/hooks/use-inspection-queries";
import { mapInspectionDtoToRecord } from "@/lib/map-inspection";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import {
  mapInspectionDetailSummaryToDetail,
  mapSummaryToMetrics,
} from "@/lib/map-audit-inspection-dashboard";
import {
  REGISTER_STATUS_FILTERS,
  toApiStatusFilter,
  type RegisterStatusFilter,
} from "@/lib/audit-inspection-status";
import { detailSummaryErrorMessage } from "@/lib/audit-inspection-errors";
import { getCurrentUser } from "@/lib/current-user";

/** Where a row in this register opens. Shared by the id link and the row click. */
const inspectionRecordHref = (id: string) =>
  `/dashboard/inspections/${encodeURIComponent(id)}/perform`;

const PAGE_SIZE = 10;

export function InspectionsListPageClient() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] =
    useState<RegisterStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const { userId } = getCurrentUser();
  const summaryQuery = useInspectionSummaryQuery(userId);

  const listParams = useMemo(
    () => ({
      pageNumber,
      pageSize: PAGE_SIZE,
      status: toApiStatusFilter(selectedStatus),
    }),
    [pageNumber, selectedStatus],
  );

  const inspectionsQuery = useInspectionsQuery(listParams);

  const page = inspectionsQuery.data?.dataModel;
  const records = useMemo(
    () => (page?.data ?? []).map(mapInspectionDtoToRecord),
    [page],
  );

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => {
      const haystack = [
        record.id,
        formatRecordDisplayId("I", record.id),
        record.title,
        record.scope,
        record.site,
        record.inspector,
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

  const activeId = selectedRecord?.id ?? null;

  const detailSummaryQuery = useInspectionDetailSummaryQuery(
    selectedRecord?.id ?? null,
  );
  const detail = useMemo(() => {
    const dto = detailSummaryQuery.data?.dataModel;
    return dto ? mapInspectionDetailSummaryToDetail(dto) : null;
  }, [detailSummaryQuery.data]);

  const metrics = useMemo(
    () => mapSummaryToMetrics(summaryQuery.data?.dataModel, "inspection"),
    [summaryQuery.data],
  );

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedRecord != null;

  const columns = useMemo(
    () =>
      withRowLink(
        createInspectionColumns({
          selectedId: activeId,
          onViewMore: handleToggleDetailPanel,
          expanded: !isPanelOpen,
        }),
        {
          getHref: (row) => inspectionRecordHref(row.id),
          getAriaLabel: (row) => `Open inspection ${row.title}`,
        },
      ),
    [activeId, handleToggleDetailPanel, isPanelOpen],
  );

  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "inspection" : "inspections"
  }`;

  const panelErrorMessage =
    isPanelOpen && detailSummaryQuery.isError
      ? detailSummaryErrorMessage(detailSummaryQuery.error)
      : null;

  const showListLoading = inspectionsQuery.isPending && !inspectionsQuery.data;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5">
      <DashboardHeader title="Inspections" />
      <div className="flex flex-1 flex-col gap-4.5 px-4 pb-8">
        {summaryQuery.isPending ? (
          <InspectionPageSkeleton />
        ) : (
          <>
            <MetricCardsRow metrics={metrics} />

            {summaryQuery.isError ? (
              <Text as="p" className="text4 text-ehs-red">
                Could not load inspection KPIs.
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
          placeholder="Search by title, scope, inspector..."
          aria-label="Search inspections"
          resultLabel={resultLabel}
        />

        {inspectionsQuery.isError ? (
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
              Could not load inspections
            </Text>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void inspectionsQuery.refetch()}
              className="mt-1"
            >
              Retry
            </Button>
          </IncidentGlassCard>
        ) : null}

        {showListLoading ? <SkeletonTable rows={8} columns={6} /> : null}

        {!showListLoading && !inspectionsQuery.isError ? (
          <div
            className={[
              "grid min-w-0 items-start gap-x-3.5 gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                : "xl:grid-cols-1",
            ].join(" ")}
          >
            <Table
              rowHref={(row) => inspectionRecordHref(row.id)}
              variant="compliance"
              data={filteredRecords}
              columns={columns}
              selectedRowId={activeId}
              getRowId={(row) => row.id}
              containerClassName={[complianceGlassCardClass, "min-w-0"].join(
                " ",
              )}
              header={
                <InspectionsRegisterHeader
                  inspectionCount={page?.totalRecords ?? 0}
                  onTemplates={() => {
                    router.push("/dashboard/inspections/template");
                  }}
                  onScheduleInspection={() => {
                    router.push("/dashboard/inspections/start");
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
                isLoading: inspectionsQuery.isFetching,
              }}
            />

            {isPanelOpen ? (
              <InspectionDetailPanel
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
