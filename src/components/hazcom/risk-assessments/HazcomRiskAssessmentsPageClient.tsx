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
import { HazcomRiskAssessmentsTable } from "@/components/hazcom/risk-assessments/HazcomRiskAssessmentsTable";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useRiskAssessmentsQuery,
} from "@/hooks/use-hazcom-queries";

export function HazcomRiskAssessmentsPageClient() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useRiskAssessmentsQuery({
      pageNumber,
      pageSize: DEFAULT_HAZCOM_PAGE_SIZE,
    });

  /** Page-scoped: the endpoint takes no search param. */
  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((assessment) =>
      [
        assessment.id,
        assessment.chemical,
        assessment.exposureScenario,
        assessment.reviewer,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Risk Assessments"]}
        title="Chemical Risk Assessments"
        subtitle="All risk assessments for chemical exposure scenarios"
        actions={
          <Link href="/dashboard/hazcom/risk-assessments/new">
            <Button type="button" variant="primary">
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              New Assessment
            </Button>
          </Link>
        }
      />

      <div className="border-ehs-border flex items-center gap-2 rounded-2xl border bg-white/70 px-4 py-3">
        <Icon
          icon="mdi:magnify"
          className="text-ehs-muted-text text-base"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by chemical, scenario, or reviewer…"
          aria-label="Search risk assessments"
          className="text-ehs-darker placeholder:text-ehs-muted-text w-full min-w-0 bg-transparent text-[13px] outline-none"
        />
        <Text
          as="span"
          className="text-ehs-muted-text hidden shrink-0 text-xs sm:inline"
        >
          {`${String(totalRecords)} assessment${totalRecords === 1 ? "" : "s"}`}
        </Text>
      </div>

      {errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load risk assessments"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!errorMessage && isLoading ? (
        <HazcomLoadingCard message="Loading risk assessments…" />
      ) : null}

      {!errorMessage && !isLoading ? (
        <>
          <HazcomRiskAssessmentsTable assessments={filteredAssessments} />
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
