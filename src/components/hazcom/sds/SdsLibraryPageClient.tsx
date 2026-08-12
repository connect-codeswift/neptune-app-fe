"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
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

  const resultLabel = `${String(filteredRecords.length)} ${
    filteredRecords.length === 1 ? "SDS record" : "SDS records"
  }`;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col gap-4 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "SDS Library"]}
        title="SDS Library"
        subtitle="Central repository for all Safety Data Sheets — 16-section GHS format"
        actions={
          <Link href="/dashboard/hazcom/sds/upload">
            <Button type="button" variant="primary">
              <Icon
                icon="mdi:tray-arrow-up"
                className="size-4"
                aria-hidden="true"
              />
              Upload SDS
            </Button>
          </Link>
        }
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
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
          <SdsLibraryTable records={filteredRecords} />
          <HazcomPager
            pageNumber={pageNumber}
            pageSize={DEFAULT_HAZCOM_PAGE_SIZE}
            totalRecords={totalRecords}
            isFetching={isFetching}
            onPageChange={setPageNumber}
          />
        </>
      ) : null}
    </div>
  );
}
