"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { MetricCardsRow } from "@/components/ui/MetricCard";
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
import type { MetricCardProps } from "@/components/ui/MetricCard";
import type { DocumentDashboardKpisDto } from "@/dtos/res/document-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_DOCUMENTS_PAGE_NUMBER,
  DEFAULT_DOCUMENTS_PAGE_SIZE,
  useDocumentByIdQuery,
  useDocumentDashboardKpisQuery,
  useDocumentsListQuery,
} from "@/hooks/use-document-queries";
import { SkeletonTable } from "@/components/ui/skeletons";
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
  return String(Math.round(percent));
}

/**
 * Builds the 4 stat cards from GET /api/Document/dashboard-kpis.
 *
 * The endpoint returns counts only, so these carry no delta. What used to sit
 * in the badge as a word ("Needs action", "Clear") is a description, not a
 * movement — it moved to the footer, and the badge fell back to its icon.
 */
function buildPolicyMakerMetrics(
  kpis: DocumentDashboardKpisDto | null,
  totalCount: number,
): readonly MetricCardProps[] {
  const hasAckRate =
    kpis?.acknowledgementRate != null &&
    Number.isFinite(kpis.acknowledgementRate);
  const active = kpis?.activeDocs ?? 0;
  const pending = kpis?.pendingReview ?? 0;
  const expiring = kpis?.expiringIn30Days ?? 0;

  return [
    {
      title: "Active docs",
      value: active,
      description: `${String(totalCount)} total in the library`,
      icon: "mdi:file-document-check-outline",
    },
    {
      title: "Pending review",
      value: pending,
      description: pending > 0 ? "Needs action" : "Clear",
      isMorePositive: false,
      target: 0,
      signalOwnedBy: "target",
      icon: "mdi:file-clock-outline",
    },
    {
      title: "Expiring (30d)",
      value: expiring,
      description: expiring > 0 ? "Watch these dates" : "Clear",
      isMorePositive: false,
      target: 0,
      signalOwnedBy: "target",
      icon: "mdi:calendar-alert",
    },
    {
      title: "Acknowledgement rate",
      value: formatAckRate(kpis?.acknowledgementRate),
      // No "%" beside an em dash — there is no figure for it to qualify.
      unit: hasAckRate ? "%" : undefined,
      description: hasAckRate
        ? "Average across active docs"
        : "Not available yet",
      icon: "mdi:check-decagram-outline",
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

  // Selection stays tied to the list row; panel body loads from GetDocumentById.
  const selectedListDocument =
    selectedId == null
      ? null
      : (documents.find((doc) => doc.id === selectedId) ?? null);

  const selectedNumericId = useMemo(() => {
    if (selectedListDocument == null) {
      return null;
    }
    const parsed = Number(selectedListDocument.id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [selectedListDocument]);

  const selectedDetailQuery = useDocumentByIdQuery({
    id: selectedNumericId,
    enabled: isClientReady && hasToken && selectedNumericId != null,
  });

  useEffect(() => {
    if (selectedId != null && selectedListDocument == null) {
      setSelectedId(null);
    }
  }, [selectedId, selectedListDocument]);

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedListDocument != null;

  const panelErrorMessage =
    isPanelOpen && selectedDetailQuery.isError
      ? getMutationErrorMessage(
          selectedDetailQuery.error,
          "Failed to load document details.",
        )
      : isPanelOpen &&
          !selectedDetailQuery.isLoading &&
          selectedDetailQuery.data == null
        ? "Document details were not found."
        : null;

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
        <MetricCardsRow metrics={metrics} />

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
            <Text as="p" className="text4 text-ehs-darker">
              Could not load documents
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text">
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
              <SkeletonTable rows={8} columns={5} />
            ) : (
              <div
                className={[
                  "grid min-w-0 items-start gap-x-3.5 gap-y-5",
                  isPanelOpen
                    ? "xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                    : "xl:grid-cols-1",
                ].join(" ")}
              >
                <PolicyMakerDocumentTable
                  categoryLabel={categoryLabel(categoryId)}
                  documentCount={documents.length}
                  documents={documents}
                  selectedId={selectedId}
                  onViewMore={handleToggleDetailPanel}
                  expanded={!isPanelOpen}
                  onUploadDocument={() =>
                    router.push("/dashboard/policy-maker/upload")
                  }
                  pagination={{
                    pageNumber,
                    pageSize,
                    totalRecords: totalCount,
                    onPageChange: setPageNumber,
                    isLoading: documentsQuery.isFetching,
                  }}
                  className="min-w-0"
                />

                {isPanelOpen ? (
                  <PolicyMakerDetailPanel
                    document={selectedDetailQuery.data ?? null}
                    isLoading={selectedDetailQuery.isLoading}
                    errorMessage={panelErrorMessage}
                    onRetry={() => {
                      void selectedDetailQuery.refetch();
                    }}
                    className="min-w-0"
                  />
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
