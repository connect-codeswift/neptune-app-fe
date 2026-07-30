"use client";

import { useEffect, useMemo, useState } from "react";
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
  PolicyDocument,
} from "@/components/policy-maker/policy-maker-types";
import type { StatMetricCardProps } from "@/components/StatMetricCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_DOCUMENTS_PAGE_NUMBER,
  DEFAULT_DOCUMENTS_PAGE_SIZE,
  useDocumentsListQuery,
} from "@/hooks/use-document-queries";
import { getAccessToken } from "@/lib/axios";
import { toast } from "@/lib/toast";

function buildLibraryCategories(
  documents: readonly PolicyDocument[],
): readonly LibraryCategory[] {
  return LIBRARY_CATEGORIES.map((category) => ({
    ...category,
    count: documents.filter((doc) => doc.category === category.id).length,
  }));
}

function buildPolicyMakerMetrics(
  documents: readonly PolicyDocument[],
): readonly StatMetricCardProps[] {
  const active = documents.filter((doc) => doc.status === "Current").length;
  const pending = documents.filter((doc) => doc.status === "In review").length;
  const expiring = documents.filter(
    (doc) => doc.status === "Expiring soon",
  ).length;

  const withAck = documents.filter((doc) => doc.acknowledgmentTotal > 0);
  const ackAverage =
    withAck.length === 0
      ? null
      : withAck.reduce(
          (sum, doc) =>
            sum + (doc.acknowledged / doc.acknowledgmentTotal) * 100,
          0,
        ) / withAck.length;
  const ackRate =
    ackAverage == null ? "—" : `${String(Math.round(ackAverage))}%`;

  return [
    {
      title: "Active docs",
      value: active,
      trendValue: `${String(documents.length)} total`,
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
      value: ackRate,
      trendValue: withAck.length > 0 ? "Avg" : "N/A",
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
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const documentsQuery = useDocumentsListQuery({
    pageNumber,
    pageSize,
    enabled: isClientReady && hasToken,
  });

  const allDocuments = documentsQuery.data?.records ?? [];
  const totalCount = documentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = pageNumber > 1 && !documentsQuery.isFetching;
  const canGoNext = pageNumber < totalPages && !documentsQuery.isFetching;

  const categories = useMemo(
    () => buildLibraryCategories(allDocuments),
    [allDocuments],
  );

  const metrics = useMemo(
    () => buildPolicyMakerMetrics(allDocuments),
    [allDocuments],
  );

  const documents = useMemo(() => {
    const byCategory = filterDocuments(
      allDocuments,
      categoryId,
      statusFilter,
    );
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

  useEffect(() => {
    if (documents.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) => {
      if (current != null && documents.some((doc) => doc.id === current)) {
        return current;
      }
      return documents[0]?.id ?? null;
    });
  }, [documents]);

  const selectedDocument =
    documents.find((doc) => doc.id === selectedId) ?? null;

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
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
        actionLabel="Upload a Document"
        actionLabelShort="Upload"
        reportHref="/dashboard/policy-maker/upload"
        onDateRangeClick={() =>
          toast.success("Date range", "Date filter coming soon.")
        }
        onNotificationsClick={() =>
          toast.success("Notifications", "Notifications coming soon.")
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
          <IncidentGlassCard className="min-h-[220px] items-center justify-center gap-2 text-center">
            <Icon
              icon="mdi:loading"
              className="text-ehs-blue size-8 animate-spin"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-muted-text text-sm">
              Loading documents…
            </Text>
          </IncidentGlassCard>
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
                selectedId={selectedId}
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
