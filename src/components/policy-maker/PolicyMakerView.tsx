"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IncidentListHeader } from "@/components/incidents/list/IncidentListHeader";
import { StatMetricCard } from "@/components/StatMetricCard";
import { PolicyMakerDetailPanel } from "@/components/policy-maker/PolicyMakerDetailPanel";
import { PolicyMakerDocumentTable } from "@/components/policy-maker/PolicyMakerDocumentTable";
import { PolicyMakerLibraryNav } from "@/components/policy-maker/PolicyMakerLibraryNav";
import {
  LIBRARY_CATEGORIES,
  POLICY_DOCUMENTS,
  POLICY_MAKER_METRICS,
  STATUS_FILTERS,
  categoryLabel,
  filterDocuments,
} from "@/components/policy-maker/policy-maker-data";
import type {
  DocumentStatusFilter,
  LibraryCategoryId,
} from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

/**
 * Document Library list view (Figma 5568:28979).
 * First row click previews in the details panel; second click opens full detail.
 */
export function PolicyMakerView() {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<LibraryCategoryId>("sops");
  const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>("sop-204");
  const [searchQuery, setSearchQuery] = useState("");

  const documents = useMemo(() => {
    const byCategory = filterDocuments(
      POLICY_DOCUMENTS,
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
  }, [categoryId, statusFilter, searchQuery]);

  const selectedDocument =
    documents.find((doc) => doc.id === selectedId) ??
    POLICY_DOCUMENTS.find((doc) => doc.id === selectedId) ??
    null;

  const handleCategorySelect = (id: string) => {
    setCategoryId(id as LibraryCategoryId);
    setStatusFilter("All");
    const next = filterDocuments(POLICY_DOCUMENTS, id, "All");
    setSelectedId(next[0]?.id ?? null);
  };

  const libraryCount =
    LIBRARY_CATEGORIES.find((item) => item.id === categoryId)?.count ??
    documents.length;

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <IncidentListHeader
        title="Policy Maker"
        searchPlaceholder="Search incidents, actions, docs…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
          {POLICY_MAKER_METRICS.map((metric) => (
            <StatMetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Library | Table | Details — Figma grid ~214 / 1fr / 311 */}
        <div className="grid min-w-0 items-start gap-[13.62px] xl:grid-cols-[214px_minmax(0,1fr)_minmax(280px,311px)]">
          <PolicyMakerLibraryNav
            categories={LIBRARY_CATEGORIES}
            selectedId={categoryId}
            onSelect={handleCategorySelect}
            onNewDocument={() => router.push("/dashboard/policy-maker/upload")}
          />

          <PolicyMakerDocumentTable
            categoryLabel={categoryLabel(categoryId)}
            documentCount={libraryCount}
            documents={documents}
            selectedId={selectedId}
            onSelect={setSelectedId}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              const next = filterDocuments(POLICY_DOCUMENTS, categoryId, value);
              if (!next.some((doc) => doc.id === selectedId)) {
                setSelectedId(next[0]?.id ?? null);
              }
            }}
            statusOptions={STATUS_FILTERS}
            onEditDocument={(document) =>
              router.push(
                `/dashboard/policy-maker/${encodeURIComponent(document.id)}/edit`,
              )
            }
            onOpenDetail={(id) =>
              router.push(`/dashboard/policy-maker/${encodeURIComponent(id)}`)
            }
          />

          <PolicyMakerDetailPanel document={selectedDocument} />
        </div>
      </div>
    </div>
  );
}
