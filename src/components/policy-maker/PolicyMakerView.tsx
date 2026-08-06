"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { StatMetricCard } from "@/components/StatMetricCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PolicyMakerDetailPanel } from "@/components/policy-maker/PolicyMakerDetailPanel";
import { PolicyMakerDocumentTable } from "@/components/policy-maker/PolicyMakerDocumentTable";
import { PolicyMakerLibraryNav } from "@/components/policy-maker/PolicyMakerLibraryNav";
import {
  LIBRARY_CATEGORIES,
  STATUS_FILTERS,
  categoryLabel,
  filterDocuments,
} from "@/components/policy-maker/policy-maker-data";
import type {
  DocumentStatusFilter,
  LibraryCategory,
  LibraryCategoryId,
} from "@/components/policy-maker/policy-maker-types";
import type { StatMetricCardProps } from "@/components/StatMetricCard";
import type {
  DocumentCategoryStatDto,
  DocumentDashboardKpisDto,
} from "@/dtos/res/document-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_DOCUMENTS_PAGE_NUMBER,
  DEFAULT_DOCUMENTS_PAGE_SIZE,
  useDocumentCategoryStatsQuery,
  useDocumentDashboardKpisQuery,
  useDocumentsListQuery,
} from "@/hooks/use-document-queries";
import {
  SkeletonListRows,
  SkeletonSidePanel,
  SkeletonTable,
} from "@/components/ui/skeletons";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { mapCategoryToLibraryId } from "@/services/mappers/document-list.mapper";
import { toast } from "@/lib/toast";

/** Builds Library nav counts from GET /api/Document/category-stats (whole library, not just the current page). */
function buildLibraryCategories(
  stats: readonly DocumentCategoryStatDto[] | null,
): readonly LibraryCategory[] {
  const counts = new Map<LibraryCategoryId, number>();
  for (const entry of stats ?? []) {
    const id = mapCategoryToLibraryId(entry.category);
    counts.set(id, (counts.get(id) ?? 0) + (entry.totalCount ?? 0));
  }

  return LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    count: counts.get(category.id) ?? 0,
  }));
}

/** `acknowledgementRate` could be a 0-1 fraction or an already-scaled percent — normalize either. */
function formatAckRate(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  const percent = value <= 1 ? value * 100 : value;
  return `${String(Math.round(percent))}%`;
}

/** Builds the 4 stat cards from GET /api/Document/dashboard-kpis. */
function buildPolicyMakerMetrics(
  kpis: DocumentDashboardKpisDto | null,
  totalCount: number,
): readonly StatMetricCardProps[] {
  const active = kpis?.activeDocs ?? 0;
  const pending = kpis?.pendingReview ?? 0;
  const expiring = kpis?.expiringIn30Days ?? 0;

  return [
    {
      title: "Active docs",
      value: active,
      trendValue: `${String(totalCount)} total`,
      trendTone: "positive",
    },
    {
      title: "Pending review",
      value: pending,
      trendValue: pending > 0 ? "Needs action" : "Clear",
      trendTone: pending > 0 ? "negative" : "positive",
    },
    {
      title: "Expiring (30d)",
      value: expiring,
      trendValue: expiring > 0 ? "Watch" : "Clear",
      trendTone: expiring > 0 ? "negative" : "positive",
    },
    {
      title: "Acknowledgement rate",
      value: formatAckRate(kpis?.acknowledgementRate),
      trendValue: kpis?.acknowledgementRate != null ? "Avg" : "N/A",
      trendTone: "positive",
    },
  ];
}

/**
 * Document Library list view (Figma 5568:28979).
 * Loads documents from POST /api/Document/allDocuments.
 * First row click previews in the details panel; second click opens full detail.
 */
export function PolicyMakerView() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<LibraryCategoryId>("sops");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_DOCUMENTS_PAGE_NUMBER);
  const [pageSize] = useState(DEFAULT_DOCUMENTS_PAGE_SIZE);
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

  const documentsQuery = useDocumentsListQuery({
    pageNumber,
    pageSize,
    enabled: isClientReady && hasToken,
  });
  const kpisQuery = useDocumentDashboardKpisQuery(isClientReady && hasToken);
  const categoryStatsQuery = useDocumentCategoryStatsQuery(
    isClientReady && hasToken,
  );

  const allDocuments = documentsQuery.data?.records ?? [];
  const totalCount = documentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !documentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !documentsQuery.isFetching;

  const categories = useMemo(
    () => buildLibraryCategories(categoryStatsQuery.data?.dataModel ?? null),
    [categoryStatsQuery.data],
  );

  const metrics = useMemo(
    () =>
      buildPolicyMakerMetrics(kpisQuery.data?.dataModel ?? null, totalCount),
    [kpisQuery.data, totalCount],
  );

  const documents = useMemo(() => {
    const byCategory = filterDocuments(allDocuments, categoryId, statusFilter);
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return byCategory;
    }
    return byCategory.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.code.toLowerCase().includes(query) ||
        doc.owner.toLowerCase().includes(query) ||
        doc.site.toLowerCase().includes(query),
    );
  }, [allDocuments, categoryId, statusFilter, searchQuery]);

  // Default to the first document, falling back to it whenever filtering drops
  // the current selection. Derived during render rather than synced through an
  // effect, so the detail pane never shows a document that just left the list.
  const selectedDocument =
    (selectedId == null
      ? undefined
      : documents.find((doc) => doc.id === selectedId)) ??
    documents[0] ??
    null;

  const handleCategorySelect = (id: string) => {
    setCategoryId(id as LibraryCategoryId);
    setStatusFilter("All");
    setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
  };

  const libraryCount =
    categories.find((item) => item.id === categoryId)?.count ??
    documents.length;

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && documentsQuery.isLoading;
  const errorMessage =
    isClientReady && !hasToken
      ? "Please sign in to load documents."
      : isClientReady && documentsQuery.isError
        ? getMutationErrorMessage(
            documentsQuery.error,
            "Failed to load documents.",
          )
        : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <IncidentListHeader
        title="Policy Maker"
        searchPlaceholder="Search incidents, actions, docs…"
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
        }}
        dateRangeLabel="March 25 — April 24, 2026"        actionLabel="Upload a Document"
        actionLabelShort="Upload"
        reportHref="/dashboard/policy-maker/upload"
        onDateRangeClick={() =>
          toast.success("Date range", "Date filter coming soon.")
        }
      />

      <div className="flex flex-1 flex-col gap-[13.62px] px-4 pb-8">
        <div className="grid grid-cols-1 gap-[13.62px] sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {errorMessage ? (
          <IncidentGlassCard className="min-h-[180px] items-center justify-center gap-2 text-center">
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-darker text-sm font-semibold">
              Could not load documents
            </Text>
            <Text as="p" className="text-ehs-muted-text text-sm">
              {errorMessage}
            </Text>
            {hasToken ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void documentsQuery.refetch()}
                className="mt-1"
              >
                Retry
              </Button>
            ) : null}
          </IncidentGlassCard>
        ) : showBootLoading || showQueryLoading ? (
          <div className="grid min-w-0 items-start gap-[13.62px] xl:grid-cols-[214px_minmax(0,1fr)_minmax(280px,311px)]">
            <SkeletonListRows rows={6} />
            <SkeletonTable rows={8} columns={4} />
            <SkeletonSidePanel />
          </div>
        ) : (
          <div className="grid min-w-0 items-start gap-[13.62px] xl:grid-cols-[214px_minmax(0,1fr)_minmax(280px,311px)]">
            <PolicyMakerLibraryNav
              categories={categories}
              selectedId={categoryId}
              onSelect={handleCategorySelect}
              onNewDocument={() =>
                router.push("/dashboard/policy-maker/upload")
              }
            />

            <div className="flex min-w-0 flex-col gap-3">
              <PolicyMakerDocumentTable
                categoryLabel={categoryLabel(categoryId)}
                documentCount={libraryCount}
                documents={documents}
                selectedId={selectedDocument?.id ?? null}
                onSelect={setSelectedId}
                statusFilter={statusFilter}
                onStatusFilterChange={(value) => {
                  setStatusFilter(value);
                  setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
                }}
                statusOptions={STATUS_FILTERS}
                onEditDocument={(document) =>
                  router.push(
                    `/dashboard/policy-maker/${encodeURIComponent(document.id)}/edit`,
                  )
                }
                onOpenDetail={(id) =>
                  router.push(
                    `/dashboard/policy-maker/${encodeURIComponent(id)}`,
                  )
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Text as="p" className="text-ehs-muted-text text-[12px]">
                  {[
                    `Page ${String(pageNumber)} of ${String(totalPages)}`,
                    totalCount > 0 ? `${String(totalCount)} total` : null,
                    documentsQuery.isFetching ? "Loading…" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="tertiary"
                    disabled={!canGoPrevious}
                    onClick={() =>
                      setPageNumber((current) => Math.max(1, current - 1))
                    }
                    className="rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-40"
                  >
                    <Icon
                      icon="mdi:chevron-left"
                      className="size-[14px]"
                      aria-hidden="true"
                    />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    disabled={!canGoNext}
                    onClick={() =>
                      setPageNumber((current) =>
                        Math.min(totalPages, current + 1),
                      )
                    }
                    className="rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-40"
                  >
                    Next
                    <Icon
                      icon="mdi:chevron-right"
                      className="size-[14px]"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            </div>

            <PolicyMakerDetailPanel document={selectedDocument} />
          </div>
        )}
      </div>
    </div>
  );
}
