"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
} from "@/components/hazcom/shared";
import { ChemicalListTable } from "@/components/hazcom/chemicals/ChemicalListTable";
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

const searchInputClass =
  "border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 h-10 w-full rounded-lg border bg-white py-2 pr-3.5 pl-9 text-[13px] shadow-sm outline-none transition focus:ring-2";

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
              className="rounded-lg px-4 py-2 text-[13px]"
            >
              <Icon
                icon="mdi:download"
                className="text-base"
                aria-hidden="true"
              />
              Export
            </Button>
            <Link href="/dashboard/hazcom/chemicals/new">
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon
                  icon="mdi:plus"
                  className="text-base"
                  aria-hidden="true"
                />
                Add Chemical
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-md min-w-0 flex-1">
          <Icon
            icon="mdi:magnify"
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, CAS#, location..."
            aria-label="Search chemicals"
            className={searchInputClass}
          />
        </div>
        <Text as="p" className="text-ehs-muted-text shrink-0 text-[13px]">
          {`${String(totalRecords)} ${
            totalRecords === 1 ? "chemical" : "chemicals"
          }`}
        </Text>
      </div>

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
