"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
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

  const resultLabel = `${String(filteredChemicals.length)} ${
    filteredChemicals.length === 1 ? "chemical" : "chemicals"
  }`;

  return (
    <div
      className={["flex min-w-0 flex-col gap-5 px-3 lg:px-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Chemical Inventory"]}
        title="Chemical Inventory"
        subtitle="All hazardous chemicals on-site — quantities, locations, and SDS links"
        actions={
          <>
            <Button
              type="button"
              variant="tertiary"
              disabled={chemicals.length === 0}
              onClick={() => exportChemicalsToCsv(chemicals)}
              className="text4 rounded-lg px-4 py-2"
            >
              <Icon
                icon="mdi:download"
                className="size-4"
                aria-hidden="true"
              />
              Export
            </Button>
            <Link href="/dashboard/hazcom/chemicals/new">
              <Button
                type="button"
                variant="primary"
                className="text4 rounded-lg px-4 py-2"
              >
                <Icon icon="mdi:plus" className="size-4" aria-hidden="true" />
                Add Chemical
              </Button>
            </Link>
          </>
        }
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
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
          <ChemicalListTable chemicals={filteredChemicals} />
          <HazcomPager
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalRecords={totalRecords}
            isFetching={isFetching}
            onPageChange={setPageNumber}
          />
        </>
      ) : null}
    </div>
  );
}
