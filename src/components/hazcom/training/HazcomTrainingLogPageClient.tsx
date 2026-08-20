"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
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
  type HazcomTrainingSession,
} from "@/components/hazcom/shared";
import { HazcomTrainingLogTable } from "@/components/hazcom/training/HazcomTrainingLogTable";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useTrainingLogsQuery,
} from "@/hooks/use-hazcom-queries";

function trainingMatchesSearch(
  session: HazcomTrainingSession,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [
    session.id,
    session.date,
    session.trainer,
    session.topic,
    session.status ?? "No status found",
    ...session.chemicals,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

const NO_STATUS_LABEL = "No status found";

function statusLabel(status: string | null): string {
  return status ?? NO_STATUS_LABEL;
}

function statusTone(status: string | null): IncidentBadgeTone {
  if (status == null) return "muted";
  return status.trim().toLowerCase() === "completed" ? "teal" : "warn";
}

export function HazcomTrainingLogPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useTrainingLogsQuery({ pageNumber, pageSize: DEFAULT_HAZCOM_PAGE_SIZE });

  /**
   * Page-scoped search: the training log endpoint takes only pageNumber and
   * pageSize, so this filters the rows already on screen.
   */
  const filteredSessions = useMemo(
    () =>
      items.filter((session) => trainingMatchesSearch(session, searchQuery)),
    [items, searchQuery],
  );

  const selectedSession = useMemo(
    () =>
      selectedId == null
        ? null
        : (filteredSessions.find((session) => session.id === selectedId) ??
          items.find((session) => session.id === selectedId) ??
          null),
    [selectedId, filteredSessions, items],
  );
  const activeSelectedId = selectedSession?.id ?? null;

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedSession != null;

  const resultLabel = `${String(filteredSessions.length)} ${
    filteredSessions.length === 1 ? "session" : "sessions"
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
          { label: "Training Log" },
        ]}
        title="Training Log"
        subtitle="Record training sessions, attendees, chemicals covered, and materials"
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by topic, trainer, chemical..."
        aria-label="Search training sessions"
        resultLabel={resultLabel}
      />

      {errorMessage ? (
        <HazcomErrorCard
          title="Couldn’t load the training log"
          message={errorMessage}
          onRetry={refetch}
        />
      ) : null}

      {!errorMessage && isLoading ? (
        <HazcomLoadingCard message="Loading training sessions…" />
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
            <HazcomTrainingLogTable
              sessions={filteredSessions}
              selectedId={activeSelectedId}
              onViewMore={handleToggleDetailPanel}
              expanded={!isPanelOpen}
              header={
                <HazcomRegisterHeader
                  title="Sessions"
                  count={totalRecords}
                  countNoun="session"
                  primaryHref="/dashboard/hazcom/training/new"
                  primaryLabel="Log Training Session"
                  primaryShortLabel="Log"
                />
              }
              className="min-w-0"
            />

            {isPanelOpen && selectedSession ? (
              <HazcomDetailPanel
                item={{
                  id: selectedSession.id,
                  title: selectedSession.topic || "Untitled session",
                  subtitle: [selectedSession.date, selectedSession.trainer]
                    .filter(Boolean)
                    .join(" · "),
                }}
                emptyMessage="Select a training session to view details."
                headerAside={
                  <IncidentBadge
                    label={statusLabel(selectedSession.status)}
                    tone={statusTone(selectedSession.status)}
                    showDot
                    className="text5 w-fit rounded-md px-2 py-0.5 tracking-normal"
                  />
                }
                metaFields={[
                  {
                    label: "Chemicals covered",
                    value:
                      selectedSession.chemicals.length > 0
                        ? selectedSession.chemicals.join(", ")
                        : "—",
                  },
                  {
                    label: "Attendees",
                    value: String(selectedSession.attendees),
                  },
                ]}
                className="min-w-0 xl:sticky xl:top-4"
              >
                <div className="border-ehs-border border-b px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Notes
                  </Text>
                  <Text
                    as="p"
                    className={[
                      "text4 line-clamp-5",
                      selectedSession.notes
                        ? "text-ehs-darker"
                        : "text-ehs-muted-text",
                    ].join(" ")}
                  >
                    {selectedSession.notes || "No notes recorded."}
                  </Text>
                </div>

                <div className="px-5 py-3.5">
                  <Text as="p" className="text9 text-ehs-muted-text mb-2">
                    Materials
                  </Text>
                  {selectedSession.materials.length === 0 ? (
                    <EmptyState
                      variant="inline"
                      icon="mdi:paperclip"
                      title="No materials attached"
                    />
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {selectedSession.materials.map((material) => (
                        <li key={`${material.fileUrl}-${material.fileName}`}>
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover inline-flex min-w-0 items-center gap-1.5"
                          >
                            <Icon
                              icon="mdi:file-document-outline"
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {material.fileName}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
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
