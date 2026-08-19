"use client";

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
  DEFAULT_WALK_TALK_PAGE_NUMBER,
  DEFAULT_WALK_TALK_PAGE_SIZE,
  useWalkTalkSessionDetailQuery,
  useWalkTalkSessionsQuery,
} from "@/hooks/use-walk-talk-queries";
import { toWalkTalkSessionDetail } from "@/lib/map-walk-talk";
import { formatRecordDisplayId } from "@/lib/format-record-id";
import { WalkTalkDetailPanel } from "./WalkTalkDetailPanel";
import { WalkTalkSessionCard } from "./WalkTalkSessionCard";
import { createWalkTalkSessionColumns } from "./WalkTalkSessionColumns";
import { WalkTalkSessionsHeader } from "./WalkTalkSessionsHeader";

const LOG_ROUTE = "/dashboard/walk-talk/log";

export type WalkTalkRecentSessionsSectionProps = Readonly<{
  onStartWalkTalk?: () => void;
}>;

export function WalkTalkRecentSessionsSection(
  props: WalkTalkRecentSessionsSectionProps,
) {
  const { onStartWalkTalk } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [pageNumber, setPageNumber] = useState(DEFAULT_WALK_TALK_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sessionsQuery = useWalkTalkSessionsQuery({
    pageNumber,
    pageSize: DEFAULT_WALK_TALK_PAGE_SIZE,
  });

  const sessions = useMemo(
    () => sessionsQuery.data?.sessions ?? [],
    [sessionsQuery.data?.sessions],
  );
  const totalRecords = sessionsQuery.data?.totalRecords ?? 0;
  const currentPageNumber = sessionsQuery.data?.pageNumber ?? pageNumber;
  const currentPageSize =
    sessionsQuery.data?.pageSize ?? DEFAULT_WALK_TALK_PAGE_SIZE;

  const typeOptions = useMemo(() => {
    const types = [
      ...new Set(
        sessions
          .map((session) => session.type.trim())
          .filter((type) => type !== ""),
      ),
    ].sort((left, right) => left.localeCompare(right));

    return ["All", ...types] as const;
  }, [sessions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sessions.filter((session) => {
      if (selectedType !== "All" && session.type !== selectedType) {
        return false;
      }
      if (needle === "") return true;

      return [
        session.id,
        formatRecordDisplayId("WT", session.id),
        session.observer,
        session.focusArea,
        session.site,
        session.type,
        session.when,
      ].some((field) => field.toLowerCase().includes(needle));
    });
  }, [sessions, query, selectedType]);

  const selectedSession =
    selectedId == null
      ? null
      : (filtered.find((session) => session.id === selectedId) ??
        sessions.find((session) => session.id === selectedId) ??
        null);

  const activeSessionId = selectedSession?.id ?? null;

  const detailQuery = useWalkTalkSessionDetailQuery(activeSessionId);

  const detail = detailQuery.data?.dataModel
    ? toWalkTalkSessionDetail(detailQuery.data.dataModel)
    : null;

  const handleToggleDetailPanel = useCallback((id: string) => {
    setSelectedId((current) => (current === id ? null : id));
  }, []);

  const isPanelOpen = selectedSession != null;

  const panelErrorMessage =
    isPanelOpen && detailQuery.isError
      ? getMutationErrorMessage(
          detailQuery.error,
          "Failed to load session details.",
        )
      : null;

  const columns = useMemo(
    () =>
      createWalkTalkSessionColumns({
        selectedId: activeSessionId,
        onViewMore: handleToggleDetailPanel,
        expanded: !isPanelOpen,
      }),
    [activeSessionId, handleToggleDetailPanel, isPanelOpen],
  );

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "session" : "sessions"
  }`;

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setPageNumber(DEFAULT_WALK_TALK_PAGE_NUMBER);
    setSelectedId(null);
  };

  const handleTypeChange = (next: string) => {
    setSelectedType(next);
    setPageNumber(DEFAULT_WALK_TALK_PAGE_NUMBER);
    setSelectedId(null);
  };

  const handleStartWalkTalk = () => {
    if (onStartWalkTalk) {
      onStartWalkTalk();
      return;
    }
    router.push(LOG_ROUTE);
  };

  const showBootLoading = sessionsQuery.isPending && !sessionsQuery.data;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <ModuleFilterBar
        segments={[
          {
            label: "Type",
            options: [...typeOptions],
            value: selectedType,
            onChange: handleTypeChange,
          },
        ]}
      />

      <ModuleSearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Search by ID, observer, site..."
        aria-label="Search sessions"
        resultLabel={resultLabel}
      />

      {sessionsQuery.isError ? (
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
              sessionsQuery.error,
              "Could not load Walk & Talk sessions.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void sessionsQuery.refetch()}
            className="mt-1"
          >
            Retry
          </Button>
        </IncidentGlassCard>
      ) : null}

      {showBootLoading ? <SkeletonTable rows={6} columns={5} /> : null}

      {!showBootLoading && !sessionsQuery.isError ? (
        <>
          {/* Mobile — card list + optional panel */}
          <div className="flex flex-col gap-3 xl:hidden">
            <IncidentGlassCard
              paddingClassName="p-0 overflow-hidden"
              className={complianceGlassCardClass}
            >
              <div className="border-b border-[rgba(15,23,42,0.08)] px-4">
                <WalkTalkSessionsHeader
                  sessionCount={filtered.length}
                  onStartWalkTalk={handleStartWalkTalk}
                />
              </div>
              <div className="flex flex-col gap-3 p-3.5">
                {filtered.length === 0 ? (
                  <Text
                    as="p"
                    className="text4 text-ehs-muted-text py-8 text-center"
                  >
                    No sessions found matching your filters.
                  </Text>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {filtered.map((session) => (
                      <li key={session.id}>
                        <WalkTalkSessionCard
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
              <WalkTalkDetailPanel
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
                  disabled={currentPageNumber <= 1 || sessionsQuery.isFetching}
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
                    sessionsQuery.isFetching
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
            ].join(" ")}
          >
            <Table
              variant="compliance"
              data={filtered}
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
                isLoading: sessionsQuery.isFetching,
              }}
              header={
                <WalkTalkSessionsHeader
                  sessionCount={filtered.length}
                  onStartWalkTalk={handleStartWalkTalk}
                />
              }
            />

            {isPanelOpen ? (
              <WalkTalkDetailPanel
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
