"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "@/components/Text";
import {
  HazcomDetailPanel,
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
  HazcomRegisterHeader,
} from "@/components/hazcom/shared";
import { ChemicalListTable } from "@/components/hazcom/chemicals/ChemicalListTable";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  chemicalMatchesSearch,
  exportChemicalsToCsv,
} from "@/components/hazcom/chemicals/chemical-utils";
import {
  DEFAULT_CHEMICALS_PAGE_NUMBER,
  DEFAULT_CHEMICALS_PAGE_SIZE,
  useChemicalsListQuery,
} from "@/hooks/use-hazcom-queries";

export type ChemicalListViewProps = Readonly<{
  className?: string;
}>;

export function ChemicalListView(props: Readonly<ChemicalListViewProps>) {
  const { className = "" } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_CHEMICALS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_CHEMICALS_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    items: chemicals,
    totalRecords,
    isLoading,
    isFetching,
    errorMessage,
    refetch,
  } = useChemicalsListQuery({ pageNumber, pageSize });

  /**
   * Page-scoped search: GET /api/hazcom/chemical accepts only pageNumber and
   * pageSize, so there is nothing to hand the server. This filters the rows
   * already on screen, not the whole inventory.
   */
  const filteredChemicals = useMemo(
    () =>
      chemicals.filter((chemical) =>
        chemicalMatchesSearch(chemical, searchQuery),
      ),
    [chemicals, searchQuery],
  );

  const selectedChemical = useMemo(
    () =>
      selectedId == null
        ? null
        : (filteredChemicals.find((chemical) => chemical.id === selectedId) ??
          chemicals.find((chemical) => chemical.id === selectedId) ??
          null),
    [selectedId, filteredChemicals, chemicals],
  );

  useEffect(() => {
    if (selectedId != null && selectedChemical == null) {
      setSelectedId(null);
    }
  }, [selectedId, selectedChemical]);

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedChemical != null;

  const resultLabel = `${String(filteredChemicals.length)} ${
    filteredChemicals.length === 1 ? "chemical" : "chemicals"
  }`;

  const handleSearchChange = (next: string) => {
    setSearchQuery(next);
    setSelectedId(null);
  };

  const chemicalMetaFields = selectedChemical
    ? [
        {
          label: "Dispose location",
          value: selectedChemical.disposeLocation ?? "Not recorded",
        },
        {
          label: "Added",
          value: selectedChemical.addedOn || "—",
        },
        {
          label: "SDS file",
          value: selectedChemical.sdsFileName ?? "Not linked",
        },
        {
          label: "Hazard codes",
          value:
            selectedChemical.hazardStatements
              .slice(0, 2)
              .map((statement) => statement.code)
              .join(", ") || "—",
        },
        {
          label: "Precaution codes",
          value:
            selectedChemical.precautionaryStatements
              .slice(0, 2)
              .map((statement) => statement.code)
              .join(", ") || "—",
        },
      ]
    : [];

  return (
    <div
      className={["flex min-h-0 flex-1 flex-col gap-3.5 px-4 pb-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Chemical Inventory"]}
        title="Chemical Inventory"
        subtitle="All hazardous chemicals on-site — quantities, locations, and SDS links"
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by name, CAS#, location..."
        aria-label="Search chemicals"
        resultLabel={resultLabel}
      />

      {errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load chemicals"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!errorMessage && isLoading ? (
        <HazcomLoadingCard message="Loading chemicals…" />
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
            <ChemicalListTable
              chemicals={filteredChemicals}
              selectedId={selectedId}
              onViewMore={handleToggleDetailPanel}
              header={
                <HazcomRegisterHeader
                  title="Inventory"
                  count={totalRecords}
                  countNoun="chemical"
                  primaryHref="/dashboard/hazcom/chemicals/new"
                  primaryLabel="Add Chemical"
                  primaryShortLabel="Add"
                  secondaryAction={{
                    label: "Export",
                    icon: "mdi:download",
                    disabled: chemicals.length === 0,
                    onClick: () => exportChemicalsToCsv(chemicals),
                  }}
                />
              }
            />

            {isPanelOpen && selectedChemical ? (
              <HazcomDetailPanel
                item={{
                  id: selectedChemical.id,
                  title: selectedChemical.name,
                  subtitle: selectedChemical.sdsRecordId
                    ? `SDS ${selectedChemical.sdsRecordId}`
                    : "No SDS record linked",
                }}
                emptyMessage="Select a chemical to view details."
                detailsHref={`/dashboard/hazcom/chemicals/${encodeURIComponent(selectedChemical.id)}`}
                metaFields={chemicalMetaFields}
                className="min-w-0 xl:sticky xl:top-4"
              >
                <div className="px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Storage &amp; handling
                  </Text>
                  <Text
                    as="p"
                    className={[
                      "text4 line-clamp-4",
                      selectedChemical.storageNotes
                        ? "text-ehs-darker"
                        : "text-ehs-muted-text",
                    ].join(" ")}
                  >
                    {selectedChemical.storageNotes || "No notes recorded."}
                  </Text>
                </div>
              </HazcomDetailPanel>
            ) : null}
          </div>

          <HazcomPager
            pageNumber={pageNumber}
            pageSize={pageSize}
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
