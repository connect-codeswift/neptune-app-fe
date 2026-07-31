"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import {
  HazcomGlassCard,
  HazcomModuleTabs,
  HazcomPageHeader,
} from "@/components/hazcom/shared";
import { ChemicalListTable } from "@/components/hazcom/chemicals/ChemicalListTable";
import {
  chemicalMatchesSearch,
  exportChemicalsToCsv,
} from "@/components/hazcom/chemicals/chemical-utils";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_CHEMICALS_PAGE_NUMBER,
  DEFAULT_CHEMICALS_PAGE_SIZE,
  useChemicalsListQuery,
} from "@/hooks/use-hazcom-queries";
import { getAccessToken } from "@/lib/axios";

export type ChemicalListViewProps = Readonly<{
  className?: string;
}>;

const searchInputClass =
  "border-ehs-border text-ehs-darker placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 h-10 w-full rounded-lg border bg-white py-2 pr-3.5 pl-9 text-[13px] shadow-sm outline-none transition focus:ring-2";

const pageButtonClass =
  "border-ehs-border text-ehs-gray hover:bg-ehs-light-bg inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** Never emits, so the snapshot flips exactly once — at hydration. */
const subscribeToNothing = () => () => {};

export function ChemicalListView(props: Readonly<ChemicalListViewProps>) {
  const { className = "" } = props;
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_CHEMICALS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_CHEMICALS_PAGE_SIZE);
  // The token lives in localStorage, so it can only be read post-hydration —
  // reading it during the server pass would desync the first client render.
  const isClientReady = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const hasToken = isClientReady && Boolean(getAccessToken());

  const chemicalsQuery = useChemicalsListQuery({
    pageNumber,
    pageSize,
    enabled: isClientReady && hasToken,
  });

  const chemicals = useMemo(
    () => chemicalsQuery.data?.chemicals ?? [],
    [chemicalsQuery.data?.chemicals],
  );
  const totalRecords = chemicalsQuery.data?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

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

  const showLoading =
    !isClientReady || (hasToken && chemicalsQuery.isLoading);
  const errorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load the chemical inventory."
      : isClientReady && chemicalsQuery.isError
        ? getMutationErrorMessage(
            chemicalsQuery.error,
            "Failed to load chemicals.",
          )
        : null;

  const canGoPrevious = pageNumber > 1 && !chemicalsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !chemicalsQuery.isFetching;

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
              <Icon icon="mdi:download" className="text-base" aria-hidden="true" />
              Export
            </Button>
            <Link href="/dashboard/hazcom/chemicals/new">
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-4 py-2 text-[13px]"
              >
                <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
                Add Chemical
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-0 max-w-md flex-1">
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
        <HazcomGlassCard className="min-h-[180px] items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Couldn’t load chemicals
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
            {errorMessage}
          </Text>
          {hasToken ? (
            <button
              type="button"
              onClick={() => void chemicalsQuery.refetch()}
              className={`${pageButtonClass} mt-1`}
            >
              <Icon icon="mdi:refresh" className="size-4" aria-hidden="true" />
              Retry
            </button>
          ) : null}
        </HazcomGlassCard>
      ) : null}

      {!errorMessage && showLoading ? (
        <HazcomGlassCard className="min-h-[240px] items-center justify-center gap-2">
          <Icon
            icon="mdi:loading"
            className="text-ehs-dark-blue size-7 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading chemicals…
          </Text>
        </HazcomGlassCard>
      ) : null}

      {!errorMessage && !showLoading ? (
        <>
          <ChemicalListTable chemicals={filteredChemicals} />

          {totalRecords > pageSize ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Text as="span" className="text-ehs-muted-text text-xs">
                {`Page ${String(pageNumber)} of ${String(totalPages)}`}
              </Text>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={pageButtonClass}
                  disabled={!canGoPrevious}
                  onClick={() => setPageNumber((current) => current - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={pageButtonClass}
                  disabled={!canGoNext}
                  onClick={() => setPageNumber((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
