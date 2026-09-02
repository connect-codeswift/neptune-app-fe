"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  HazcomDetailPanel,
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
  HazcomRegisterHeader,
  type HazcomTrainingSession,
  type HazcomTrainingStatus,
} from "@/components/hazcom/shared";
import {
  HazcomTrainingLogTable,
  trainingChemicalsLabel,
} from "@/components/hazcom/training/HazcomTrainingLogTable";
import { HAZCOM_TRAINING_STATUSES } from "@/components/hazcom/training/hazcom-training-schema";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useTrainingLogsQuery,
} from "@/hooks/use-hazcom-queries";
import { useUpdateTrainingStatusMutation } from "@/hooks/use-hazcom-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { parseRecordNumericId } from "@/lib/format-record-id";
import { toast } from "@/lib/toast";

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
    // Was `...session.chemicals`, which is empty for every session created
    // since the chemical became a foreign key — so searching a chemical name
    // matched nothing. Same resolution the table column uses.
    trainingChemicalsLabel(session),
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

const NO_STATUS_LABEL = "No status found";

const STATUS_SELECT_CLASS: Readonly<Record<HazcomTrainingStatus, string>> = {
  Scheduled: "bg-ehs-yellow/10 text-ehs-yellow",
  InProgress: "bg-ehs-normal-blue/10 text-ehs-dark-blue",
  Completed: "bg-ehs-green/10 text-ehs-green",
  Cancelled: "bg-ehs-gray/15 text-ehs-gray",
};

/**
 * `PUT /trainings/{id}/status` — a status-only transition, no need to resend
 * the whole form. A single styled `<select>` standing in for the status
 * badge, rather than a badge with a hidden control layered underneath.
 *
 * `Completed` is the end of the line. A completed training is the evidence
 * that these people were trained on this chemical on that date, so moving it
 * back to Scheduled or InProgress — or to Cancelled, denying a session that
 * happened — would retract the evidence while keeping the record. The API
 * refuses the transition; this stops the control from offering it. The guided
 * action below already stopped at Completed, so this select was the only way
 * to do it.
 */
function TrainingStatusControl(
  props: Readonly<{ session: HazcomTrainingSession }>,
) {
  const { session } = props;
  const updateStatus = useUpdateTrainingStatusMutation();
  const numericId = parseRecordNumericId(session.id);
  const isFinal = session.status === "Completed";
  const toneClass = session.status
    ? STATUS_SELECT_CLASS[session.status]
    : "bg-ehs-gray/15 text-ehs-gray";

  const handleChange = (next: string) => {
    if (numericId === null || next === session.status) {
      return;
    }

    updateStatus.mutate(
      { id: numericId, payload: { status: next } },
      {
        onSuccess: () => {
          toast.success(`Status changed to ${next}`);
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not update the status. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <select
      aria-label="Training status"
      value={session.status ?? ""}
      disabled={numericId === null || updateStatus.isPending || isFinal}
      title={
        isFinal
          ? "A completed training is a compliance record. Its status is final."
          : undefined
      }
      onChange={(event) => handleChange(event.target.value)}
      className={[
        "text5 w-fit appearance-none rounded-md px-2 py-0.5 tracking-normal",
        // A settled record reads as settled, not as a control mid-request:
        // the dimming is for the transient disabled states only.
        isFinal
          ? "cursor-default"
          : "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
        toneClass,
      ].join(" ")}
    >
      {session.status === null ? (
        <option value="">{NO_STATUS_LABEL}</option>
      ) : null}
      {HAZCOM_TRAINING_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

/**
 * Guided status action, below Materials: `Scheduled` gets "Start Before
 * Schedule" (→ InProgress), `InProgress` gets "Training Completed" (→
 * Completed). A due `Scheduled` session already reads as `InProgress` by the
 * time it's fetched — the backend self-promotes it on read — so this needs
 * no date math of its own, just the two status values. Nothing renders once
 * a session is `Completed`/`Cancelled`.
 */
function TrainingStatusAction(
  props: Readonly<{ session: HazcomTrainingSession }>,
) {
  const { session } = props;
  const updateStatus = useUpdateTrainingStatusMutation();
  const numericId = parseRecordNumericId(session.id);

  if (session.status !== "Scheduled" && session.status !== "InProgress") {
    return null;
  }

  const next = session.status === "Scheduled" ? "InProgress" : "Completed";
  const label =
    session.status === "Scheduled"
      ? "Start Before Schedule"
      : "Training Completed";
  const icon =
    session.status === "Scheduled"
      ? "mdi:play-circle-outline"
      : "mdi:check-circle-outline";

  const handleClick = () => {
    if (numericId === null) return;

    updateStatus.mutate(
      { id: numericId, payload: { status: next } },
      {
        onSuccess: () => {
          toast.success(`Status changed to ${next}`);
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not update the status. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <div className="px-5 py-3.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={numericId === null || updateStatus.isPending}
        className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover text-ehs-on-accent flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon={icon} className="size-4" aria-hidden="true" />
        {label}
      </button>
    </div>
  );
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
          { label: "Schedule Training" },
        ]}
        title="Schedule Training"
        subtitle="Schedule, assign, and track HazCom training sessions through completion"
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
                  title="Scheduled Trainings"
                  count={totalRecords}
                  countNoun="session"
                  primaryHref="/dashboard/hazcom/training/new"
                  primaryLabel="Schedule Training"
                  primaryShortLabel="Schedule"
                  primaryCapability="HazCom.Create"
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
                  <TrainingStatusControl session={selectedSession} />
                }
                metaFields={[
                  {
                    label: "Chemicals covered",
                    // Same resolution as the table column and the search: the
                    // legacy free-text list is empty on every session created
                    // since the chemical became a foreign key, so this panel
                    // read "—" even when the record named a chemical.
                    value: trainingChemicalsLabel(selectedSession) || "—",
                  },
                  {
                    label: "Attendees",
                    value:
                      selectedSession.attendeeNames ||
                      String(selectedSession.attendees),
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

                <TrainingStatusAction session={selectedSession} />
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
