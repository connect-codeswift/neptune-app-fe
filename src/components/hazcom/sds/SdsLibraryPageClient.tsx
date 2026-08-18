"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "@/components/Text";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  HazcomDetailPanel,
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
  HazcomRegisterHeader,
} from "@/components/hazcom/shared";
import { SdsLibraryTable } from "@/components/hazcom/sds/SdsLibraryTable";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useSdsListQuery,
} from "@/hooks/use-hazcom-queries";

export function SdsLibraryPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useSdsListQuery({ pageNumber, pageSize: DEFAULT_HAZCOM_PAGE_SIZE });

  /**
   * Page-scoped search: GET /api/hazcom/sds takes only pageNumber and
   * pageSize, so this filters the rows already on screen, not the library.
   */
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((record) =>
      [record.chemicalName, record.manufacturer, record.casNumber]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchQuery]);

  const selectedRecord = useMemo(
    () =>
      selectedId == null
        ? null
        : (filteredRecords.find((record) => record.id === selectedId) ??
          items.find((record) => record.id === selectedId) ??
          null),
    [selectedId, filteredRecords, items],
  );

  useEffect(() => {
    if (selectedId != null && selectedRecord == null) {
      setSelectedId(null);
    }
  }, [selectedId, selectedRecord]);

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedRecord != null;

  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "SDS record" : "SDS records"
  }`;

  const handleSearchChange = (next: string) => {
    setSearchQuery(next);
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={[
          { label: "Safety" },
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "SDS Library" },
        ]}
        title="SDS Library"
        subtitle="Central repository for all Safety Data Sheets — 16-section GHS format"
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by name, manufacturer, CAS#..."
        aria-label="Search SDS records"
        resultLabel={resultLabel}
      />

      {errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load the SDS library"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!errorMessage && isLoading ? (
        <HazcomLoadingCard message="Loading SDS records…" />
      ) : null}

      {!errorMessage && !isLoading ? (
        <>
          <div
            className={[
              "grid min-w-0 items-start gap-x-3.5 gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                : "xl:grid-cols-1",
            ].join(" ")}
          >
            <SdsLibraryTable
              records={filteredRecords}
              selectedId={selectedId}
              onViewMore={handleToggleDetailPanel}
              expanded={!isPanelOpen}
              header={
                <HazcomRegisterHeader
                  title="Library"
                  count={totalRecords}
                  countNoun="record"
                  primaryHref="/dashboard/hazcom/sds/upload"
                  primaryLabel="Upload SDS"
                  primaryShortLabel="Upload"
                  primaryIcon="mdi:tray-arrow-up"
                />
              }
              className="min-w-0"
            />

            {isPanelOpen && selectedRecord ? (
              <HazcomDetailPanel
                item={{
                  id: selectedRecord.id,
                  title: selectedRecord.chemicalName,
                  subtitle: selectedRecord.version,
                }}
                emptyMessage="Select an SDS record to view details."
                detailsHref={`/dashboard/hazcom/sds/${encodeURIComponent(selectedRecord.id)}`}
                metaFields={[
                  {
                    label: "Manufacturer",
                    value: selectedRecord.manufacturer || "—",
                  },
                  {
                    label: "CAS #",
                    value: selectedRecord.casNumber || "—",
                  },
                  {
                    label: "Hazard",
                    value: selectedRecord.hazardClass || "—",
                  },
                  {
                    label: "Revised",
                    value: selectedRecord.revisedOn || "—",
                  },
                ]}
                className="min-w-0 xl:sticky xl:top-4"
              >
                <div className="px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Full SDS
                  </Text>
                  <Text as="p" className="text4 text-ehs-darker">
                    Open details to view all 16 GHS sections for this sheet.
                  </Text>
                </div>
              </HazcomDetailPanel>
            ) : null}
          </div>

          <HazcomPager
            pageNumber={pageNumber}
            pageSize={DEFAULT_HAZCOM_PAGE_SIZE}
            totalRecords={totalRecords}
            isFetching={isFetching}
            onPageChange={(nextPage) => {
              setPageNumber(nextPage);
              setSelectedId(null);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
