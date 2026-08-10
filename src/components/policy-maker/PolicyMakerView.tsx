"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { StatMetricCard } from "@/components/StatMetricCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import { PolicyMakerDetailPanel } from "@/components/policy-maker/PolicyMakerDetailPanel";
import { PolicyMakerDocumentTable } from "@/components/policy-maker/PolicyMakerDocumentTable";
import {
  LIBRARY_CATEGORIES,
  STATUS_FILTERS,
  categoryLabel,
  documentMatchesSearch,
  filterDocuments,
} from "@/components/policy-maker/policy-maker-data";
import type {
  DocumentStatusFilter,
  LibraryCategoryId,
} from "@/components/policy-maker/policy-maker-types";
import type { StatMetricCardProps } from "@/components/StatMetricCard";
import type { DocumentDashboardKpisDto } from "@/dtos/res/document-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_DOCUMENTS_PAGE_NUMBER,
  DEFAULT_DOCUMENTS_PAGE_SIZE,
  useDocumentDashboardKpisQuery,
  useDocumentsListQuery,
} from "@/hooks/use-document-queries";
import { SkeletonSidePanel, SkeletonTable } from "@/components/ui/skeletons";
import { useHasAccessToken } from "@/hooks/use-has-access-token";

type CategoryFilter = "all" | LibraryCategoryId;

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  ...LIBRARY_CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  })),
] as const;

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
 * Document Library list view.
 * Cards → filters → search → table + detail panel.
 */
export function PolicyMakerView() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const totalCount = documentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !documentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !documentsQuery.isFetching;

  const metrics = useMemo(
    () =>
      buildPolicyMakerMetrics(kpisQuery.data?.dataModel ?? null, totalCount),
    [kpisQuery.data, totalCount],
  );

  const documents = useMemo(() => {
    const filtered = filterDocuments(
      documentsQuery.data?.records ?? [],
      categoryId,
      statusFilter,
    );
    return filtered.filter((document) =>
      documentMatchesSearch(document, searchQuery),
    );
  }, [documentsQuery.data?.records, categoryId, statusFilter, searchQuery]);

  const selectedDocument =
    (selectedId == null
      ? undefined
      : documents.find((doc) => doc.id === selectedId)) ??
    documents[0] ??
    null;

  const resultLabel = `${String(documents.length)} ${
    documents.length === 1 ? "document" : "documents"
  }`;

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
      <DashboardHeader title="Policy Maker" />

      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {errorMessage ? (
          <IncidentGlassCard
            className="min-h-45 text-center"
            incidentGlassCardClassName="items-center justify-center gap-2"
          >
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
        ) : (
          <>
            <ModuleFilterBar
              segments={[
                {
                  label: "Category",
                  options: [...CATEGORY_FILTER_OPTIONS],
                  value: categoryId,
                  onChange: (value) => {
                    setCategoryId(value as CategoryFilter);
                    setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
                  },
                },
                {
                  label: "Status",
                  options: STATUS_FILTERS,
                  value: statusFilter,
                  onChange: (value) => {
                    setStatusFilter(value as DocumentStatusFilter);
                    setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
                  },
                },
              ]}
            />

            <ModuleSearchBar
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setPageNumber(DEFAULT_DOCUMENTS_PAGE_NUMBER);
              }}
              placeholder="Search by title, code, owner..."
              aria-label="Search documents"
              resultLabel={resultLabel}
            />

            {showBootLoading || showQueryLoading ? (
              <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_auto]">
                <SkeletonTable rows={8} columns={5} />
                <div className="w-full xl:w-[311px]">
                  <SkeletonSidePanel />
                </div>
              </div>
            ) : (
              <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex min-w-0 flex-col gap-3">
                  <PolicyMakerDocumentTable
                    categoryLabel={categoryLabel(categoryId)}
                    documentCount={documents.length}
                    documents={documents}
                    selectedId={selectedDocument?.id ?? null}
                    onSelect={setSelectedId}
                    onUploadDocument={() =>
                      router.push("/dashboard/policy-maker/upload")
                    }
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
                          className="size-3.5"
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
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                <PolicyMakerDetailPanel
                  document={selectedDocument}
                  className="w-full xl:w-[311px]"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
