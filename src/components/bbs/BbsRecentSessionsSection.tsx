"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Table } from "@/components/ui/Table";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_BBS_PAGE_NUMBER,
  DEFAULT_BBS_PAGE_SIZE,
  useBbsObservationsQuery,
  useBehaviorCategoriesQuery,
} from "@/hooks/use-bbs-queries";
import { BbsObservationCard } from "./BbsObservationCard";
import { bbsSessionColumns } from "./BbsSessionColumns";
import { BbsSearchBar, BbsSessionsHeader } from "./BbsSessionsToolbar";

export type BbsRecentSessionsSectionProps = Readonly<{
  onLogObservation?: () => void;
}>;

export function BbsRecentSessionsSection(props: BbsRecentSessionsSectionProps) {
  const { onLogObservation } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");
  /** Empty string means All — no categoryId is sent to the API. */
  const [categoryId, setCategoryId] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_BBS_PAGE_NUMBER);

  const categoriesQuery = useBehaviorCategoriesQuery();

  const categoryOptions = useMemo(() => {
    const categories = [...(categoriesQuery.data ?? [])]
      .filter(
        (category) =>
          category.isActive !== false &&
          category.id !== undefined &&
          category.name.trim(),
      )
      .sort((left, right) => {
        const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return left.name.localeCompare(right.name);
      });

    return categories.map((category) => ({
      value: String(category.id),
      label: category.name,
    }));
  }, [categoriesQuery.data]);

  const selectedCategoryId = categoryId === "" ? undefined : Number(categoryId);

  const observationsQuery = useBbsObservationsQuery({
    observe: query.trim(),
    categoryId: selectedCategoryId,
    pageNumber,
    pageSize: DEFAULT_BBS_PAGE_SIZE,
  });

  const sessions = observationsQuery.data?.sessions ?? [];
  const totalRecords = observationsQuery.data?.totalRecords ?? 0;
  const currentPageNumber = observationsQuery.data?.pageNumber ?? pageNumber;
  const currentPageSize =
    observationsQuery.data?.pageSize ?? DEFAULT_BBS_PAGE_SIZE;

  const resultLabel = `${String(totalRecords)} ${
    totalRecords === 1 ? "session" : "sessions"
  }`;

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setPageNumber(DEFAULT_BBS_PAGE_NUMBER);
  };

  const handleCategoryChange = (next: string) => {
    setCategoryId(next);
    setPageNumber(DEFAULT_BBS_PAGE_NUMBER);
  };

  const handleLogObservation = () => {
    if (onLogObservation) {
      onLogObservation();
      return;
    }
    router.push("/dashboard/bbs/log");
  };

  const openObservation = (id: string) => {
    router.push(`/dashboard/bbs/observation?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <BbsSearchBar
        value={query}
        onChange={handleQueryChange}
        resultLabel={resultLabel}
        categoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        categoryOptions={categoryOptions}
        categoriesLoading={categoriesQuery.isPending}
      />

      {observationsQuery.isPending && !observationsQuery.data ? (
        <div className="border-ehs-border flex items-center gap-2 rounded-2xl border bg-white/70 px-4 py-6">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-5 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading sessions...
          </Text>
        </div>
      ) : null}

      {observationsQuery.isError ? (
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            observationsQuery.error,
            "Could not load BBS sessions.",
          )}
        </Text>
      ) : null}

      {!observationsQuery.isPending || observationsQuery.data ? (
        <>
          {/* Mobile — card list */}
          <div className="flex flex-col gap-3 md:hidden">
            <BbsSessionsHeader onLogObservation={handleLogObservation} />
            {sessions.length === 0 ? (
              <p className="text-ehs-muted-text text-sm">No sessions found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <BbsObservationCard
                      session={session}
                      onClick={() => {
                        openObservation(session.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
            {totalRecords > currentPageSize ? (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={
                    currentPageNumber <= 1 || observationsQuery.isFetching
                  }
                  onClick={() => {
                    setPageNumber((page) => Math.max(1, page - 1));
                  }}
                  className="text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer text-sm font-semibold disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-ehs-muted-text text-sm">
                  {`${String(currentPageNumber)} / ${String(Math.max(1, Math.ceil(totalRecords / currentPageSize)))}`}
                </span>
                <button
                  type="button"
                  disabled={
                    currentPageNumber * currentPageSize >= totalRecords ||
                    observationsQuery.isFetching
                  }
                  onClick={() => {
                    setPageNumber((page) => page + 1);
                  }}
                  className="text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer text-sm font-semibold disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          {/* Desktop — table */}
          <div className="hidden min-w-0 md:block">
            <Table
              data={sessions}
              columns={bbsSessionColumns}
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                openObservation(row.id);
              }}
              containerClassName="min-w-0"
              pagination={{
                pageNumber: currentPageNumber,
                pageSize: currentPageSize,
                totalRecords,
                onPageChange: setPageNumber,
                isLoading: observationsQuery.isFetching,
              }}
              header={
                <BbsSessionsHeader onLogObservation={handleLogObservation} />
              }
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
