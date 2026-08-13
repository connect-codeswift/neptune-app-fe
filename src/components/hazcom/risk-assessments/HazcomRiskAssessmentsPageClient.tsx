"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "@/components/Text";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  IncidentBadge,
  type IncidentBadgeTone,
} from "@/components/near-miss/IncidentBadge";
import {
  HazcomDetailPanel,
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
  HazcomRegisterHeader,
  type HazcomRiskAssessment,
} from "@/components/hazcom/shared";
import { HazcomRiskAssessmentsTable } from "@/components/hazcom/risk-assessments/HazcomRiskAssessmentsTable";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useRiskAssessmentsQuery,
} from "@/hooks/use-hazcom-queries";

function assessmentMatchesSearch(
  assessment: HazcomRiskAssessment,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [
    assessment.id,
    assessment.chemical,
    assessment.exposureScenario,
    assessment.reviewer,
    assessment.riskLevel,
    assessment.status,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function riskLevelTone(value: string): IncidentBadgeTone {
  switch (value.trim().toLowerCase()) {
    case "low":
      return "teal";
    case "medium":
      return "warn";
    case "high":
    case "critical":
      return "danger";
    default:
      return "neutral";
  }
}

function assessmentStatusTone(value: string): IncidentBadgeTone {
  switch (value.trim().toLowerCase()) {
    case "approved":
      return "teal";
    case "pending":
      return "warn";
    case "draft":
      return "muted";
    default:
      return "neutral";
  }
}

export function HazcomRiskAssessmentsPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useRiskAssessmentsQuery({
      pageNumber,
      pageSize: DEFAULT_HAZCOM_PAGE_SIZE,
    });

  /** Page-scoped: the endpoint takes no search param. */
  const filteredAssessments = useMemo(
    () =>
      items.filter((assessment) =>
        assessmentMatchesSearch(assessment, searchQuery),
      ),
    [items, searchQuery],
  );

  const selectedAssessment = useMemo(
    () =>
      selectedId == null
        ? null
        : (filteredAssessments.find(
            (assessment) => assessment.id === selectedId,
          ) ??
          items.find((assessment) => assessment.id === selectedId) ??
          null),
    [selectedId, filteredAssessments, items],
  );

  useEffect(() => {
    if (selectedId != null && selectedAssessment == null) {
      setSelectedId(null);
    }
  }, [selectedId, selectedAssessment]);

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedAssessment != null;

  const resultLabel = `${String(filteredAssessments.length)} ${
    filteredAssessments.length === 1 ? "assessment" : "assessments"
  }`;

  const handleSearchChange = (next: string) => {
    setSearchQuery(next);
    setSelectedId(null);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={[
          { label: "Safety" },
          { label: "HazCom", href: "/dashboard/hazcom/overview" },
          { label: "Reports" },
        ]}
        title="Chemical Risk Assessments"
        subtitle="All risk assessments for chemical exposure scenarios"
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by chemical, scenario, or reviewer..."
        aria-label="Search risk assessments"
        resultLabel={resultLabel}
      />

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
          <div
            className={[
              "grid min-w-0 items-start gap-x-3.5 gap-y-5",
              isPanelOpen
                ? "xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]"
                : "xl:grid-cols-1",
            ].join(" ")}
          >
            <HazcomRiskAssessmentsTable
              assessments={filteredAssessments}
              selectedId={selectedId}
              onViewMore={handleToggleDetailPanel}
              expanded={!isPanelOpen}
              header={
                <HazcomRegisterHeader
                  title="Assessments"
                  count={totalRecords}
                  countNoun="assessment"
                  primaryHref="/dashboard/hazcom/risk-assessments/new"
                  primaryLabel="New Assessment"
                  primaryShortLabel="New"
                />
              }
              className="min-w-0"
            />

            {isPanelOpen && selectedAssessment ? (
              <HazcomDetailPanel
                item={{
                  id: selectedAssessment.id,
                  title: selectedAssessment.chemical || "Untitled assessment",
                  subtitle: selectedAssessment.exposureScenario || undefined,
                }}
                emptyMessage="Select an assessment to view details."
                headerAside={
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    <IncidentBadge
                      label={selectedAssessment.riskLevel}
                      tone={riskLevelTone(selectedAssessment.riskLevel)}
                      className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
                    />
                    <IncidentBadge
                      label={selectedAssessment.status}
                      tone={assessmentStatusTone(selectedAssessment.status)}
                      showDot
                      className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
                    />
                  </div>
                }
                metaFields={[
                  {
                    label: "Reviewer",
                    value: selectedAssessment.reviewer || "—",
                  },
                  {
                    label: "Date",
                    value: selectedAssessment.date || "—",
                  },
                  {
                    label: "Duration",
                    value:
                      selectedAssessment.exposureMinutes > 0
                        ? `${String(selectedAssessment.exposureMinutes)} min`
                        : "—",
                  },
                  {
                    label: "Frequency",
                    value: selectedAssessment.frequency || "—",
                  },
                ]}
                className="min-w-0 xl:sticky xl:top-4"
              >
                <div className="border-ehs-border border-b px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Recommended PPE
                  </Text>
                  {selectedAssessment.ppe.length === 0 ? (
                    <Text as="p" className="text4 text-ehs-muted-text">
                      None recorded.
                    </Text>
                  ) : (
                    <Text as="p" className="text4 text-ehs-darker">
                      {selectedAssessment.ppe.join(", ")}
                    </Text>
                  )}
                </div>

                <div className="px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Controls / mitigation
                  </Text>
                  <Text
                    as="p"
                    className={[
                      "text4 line-clamp-5",
                      selectedAssessment.controls
                        ? "text-ehs-darker"
                        : "text-ehs-muted-text",
                    ].join(" ")}
                  >
                    {selectedAssessment.controls || "No notes recorded."}
                  </Text>
                </div>
              </HazcomDetailPanel>
            ) : null}
          </div>

          <HazcomPager
            pageNumber={pageNumber}
            pageSize={DEFAULT_HAZCOM_PAGE_SIZE}
            totalRecords={totalRecords}
            isFetching={isFetching}
            onPageChange={(nextPage) => {
              setPageNumber(nextPage);
              setSelectedId(null);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
