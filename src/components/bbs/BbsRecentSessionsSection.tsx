"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { SkeletonTable } from "@/components/ui/skeletons";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { complianceGlassCardClass } from "@/components/regulatory-compliance/compliance-ui";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_BBS_PAGE_NUMBER,
  DEFAULT_BBS_PAGE_SIZE,
  useBbsObservationDetailQuery,
  useBbsObservationsQuery,
  useBehaviorCategoriesQuery,
} from "@/hooks/use-bbs-queries";
import { toObservationDetail } from "@/lib/map-bbs";
import { withRowLink } from "@/components/ui/table-row-link";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";
import { BbsDetailPanel } from "./BbsDetailPanel";
import { BbsObservationCard } from "./BbsObservationCard";
import { createBbsSessionColumns } from "./BbsSessionColumns";
import { BbsSessionsHeader } from "./BbsSessionsHeader";

/** Where a row in this register opens. Shared by the id link and the row click. */
const bbsSessionHref = (id: string) =>
  `/dashboard/bbs/observation?id=${encodeURIComponent(id)}`;

const TYPE_FILTERS = ["All", "Safe", "At-Risk"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

export type BbsRecentSessionsSectionProps = Readonly<{
  onLogObservation?: () => void;
}>;

export function BbsRecentSessionsSection(props: BbsRecentSessionsSectionProps) {
  const { onLogObservation } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");
  /** Empty string means All — no categoryId is sent to the API. */
  const [categoryId, setCategoryId] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [pageNumber, setPageNumber] = useState(DEFAULT_BBS_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    // `observe` is the Safe / At-Risk filter, not the search box — sending the
    // search text here is what made every typed query 400, and it left the type
    // filter to be applied in the browser over one page of rows.
    observe: typeFilter === "All" ? "" : typeFilter,
    search: query.trim(),
    categoryId: selectedCategoryId,
    pageNumber,
    pageSize: DEFAULT_BBS_PAGE_SIZE,
  });

  const sessions = useMemo(
    () => observationsQuery.data?.sessions ?? [],
    [observationsQuery.data?.sessions],
  );
  const totalRecords = observationsQuery.data?.totalRecords ?? 0;
  const currentPageNumber = observationsQuery.data?.pageNumber ?? pageNumber;
  const currentPageSize =
    observationsQuery.data?.pageSize ?? DEFAULT_BBS_PAGE_SIZE;

  const selectedSession =
    selectedId == null
      ? null
      : (sessions.find((session) => session.id === selectedId) ?? null);

  const activeSessionId: string | null = selectedSession?.id ?? null;

  const detailQuery = useBbsObservationDetailQuery(selectedSession?.id ?? null);

  const detail = detailQuery.data?.dataModel
    ? toObservationDetail(detailQuery.data.dataModel)
    : null;

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedSession != null;

  const panelErrorMessage =
    isPanelOpen && detailQuery.isError
      ? getMutationErrorMessage(
          detailQuery.error,
          "Failed to load observation details.",
        )
      : null;

  const columns = useMemo(
    () =>
      withRowLink<BbsSession>(
        createBbsSessionColumns({
          selectedId: activeSessionId,
          onViewMore: handleToggleDetailPanel,
          expanded: !isPanelOpen,
        }),
        {
          getHref: (session) => bbsSessionHref(session.id),
          getAriaLabel: (session) => `Open BBS session ${session.id}`,
        },
      ),
    [activeSessionId, handleToggleDetailPanel, isPanelOpen],
  );

  // The server's total for the active filters, not the page length — otherwise
  // a filter matching 40 rows reads as "10 sessions" on every page.
  const resultLabel = `${String(totalRecords)} ${
    totalRecords === 1 ? "session" : "sessions"
  }`;

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setPageNumber(DEFAULT_BBS_PAGE_NUMBER);
    setSelectedId(null);
  };

  const handleCategoryChange = (next: string) => {
    setCategoryId(next);
    setPageNumber(DEFAULT_BBS_PAGE_NUMBER);
    setSelectedId(null);
  };

  const handleTypeChange = (next: string) => {
    setTypeFilter(next as TypeFilter);
    // Narrowing the set can leave the current page past the end of it, which
    // reads as "no records" for a filter that actually matched plenty.
    setPageNumber(DEFAULT_BBS_PAGE_NUMBER);
    setSelectedId(null);
  };

  const handleLogObservation = () => {
    if (onLogObservation) {
      onLogObservation();
      return;
    }
    router.push("/dashboard/bbs/log");
  };

  const showBootLoading =
    observationsQuery.isPending && !observationsQuery.data;
  const isRefreshing =
    observationsQuery.isFetching && !observationsQuery.isPending;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Category",
            options: [{ value: "", label: "All" }, ...categoryOptions],
            value: categoryId,
            onChange: handleCategoryChange,
            disabled: categoriesQuery.isPending,
          },
          {
            label: "Type",
            options: [...TYPE_FILTERS],
            value: typeFilter,
            onChange: handleTypeChange,
          },
        ]}
      />

      <ModuleSearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search by ID, observer, location..."
        aria-label="Search sessions"
        resultLabel={resultLabel}
      />

      {observationsQuery.isError ? (
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
            Could not load sessions
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text">
            {getMutationErrorMessage(
              observationsQuery.error,
              "Could not load BBS sessions.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void observationsQuery.refetch()}
            className="mt-1"
          >
            Retry
          </Button>
        </IncidentGlassCard>
      ) : null}

      {showBootLoading ? <SkeletonTable rows={8} columns={6} /> : null}

      {!showBootLoading && !observationsQuery.isError ? (
        <>
          {/* Mobile — card list + optional panel */}
          <div className="flex flex-col gap-3 xl:hidden">
            <IncidentGlassCard
              paddingClassName="p-0 overflow-hidden"
              className={[
                complianceGlassCardClass,
                isRefreshing ? "opacity-70 transition-opacity" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="border-ehs-border-ink/8 border-b px-4">
                <BbsSessionsHeader
                  sessionCount={totalRecords}
                  onLogObservation={handleLogObservation}
                />
              </div>
              <div className="flex flex-col gap-3 p-3.5">
                {sessions.length === 0 ? (
                  <EmptyState
                    variant="plain"
                    icon="mdi:eye-outline"
                    title="No sessions found"
                    message="Try clearing the search or filters."
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {sessions.map((session) => (
                      <li key={session.id}>
                        <BbsObservationCard
                          session={session}
                          isSelected={activeSessionId === session.id}
                          onViewMore={() => {
                            handleToggleDetailPanel(session.id);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </IncidentGlassCard>

            {isPanelOpen ? (
              <BbsDetailPanel
                session={selectedSession}
                detail={detail}
                isLoading={detailQuery.isLoading}
                errorMessage={panelErrorMessage}
                onRetry={() => {
                  void detailQuery.refetch();
                }}
              />
            ) : null}

            {totalRecords > currentPageSize ? (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={
                    currentPageNumber <= 1 || observationsQuery.isFetching
                  }
                  onClick={() => {
                    setPageNumber((page) => Math.max(1, page - 1));
                    setSelectedId(null);
                  }}
                  className="text4 text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text8 text-ehs-muted-text tabular-nums">
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
                    setSelectedId(null);
                  }}
                  className="text4 text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          {/* Desktop — table + side panel */}
          <div
            className={[
              "hidden min-w-0 xl:grid xl:items-start xl:gap-x-3.5 xl:gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                : "xl:grid-cols-1",
              isRefreshing ? "opacity-70 transition-opacity" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Table
              rowHref={(row) => bbsSessionHref(row.id)}
              variant="compliance"
              data={sessions}
              columns={columns}
              getRowId={(row) => row.id}
              selectedRowId={activeSessionId}
              containerClassName={[complianceGlassCardClass, "min-w-0"].join(
                " ",
              )}
              pagination={{
                pageNumber: currentPageNumber,
                pageSize: currentPageSize,
                totalRecords,
                onPageChange: (nextPage) => {
                  setPageNumber(nextPage);
                  setSelectedId(null);
                },
                isLoading: observationsQuery.isFetching,
              }}
              header={
                <BbsSessionsHeader
                  sessionCount={totalRecords}
                  onLogObservation={handleLogObservation}
                />
              }
            />

            {isPanelOpen ? (
              <BbsDetailPanel
                session={selectedSession}
                detail={detail}
                isLoading={detailQuery.isLoading}
                errorMessage={panelErrorMessage}
                onRetry={() => {
                  void detailQuery.refetch();
                }}
                className="min-w-0 xl:sticky xl:top-4"
              />
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
