"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Table } from "@/components/ui/Table";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  DEFAULT_WALK_TALK_PAGE_NUMBER,
  DEFAULT_WALK_TALK_PAGE_SIZE,
  useWalkTalkSessionsQuery,
} from "@/hooks/use-walk-talk-queries";
import { WalkTalkSessionCard } from "./WalkTalkSessionCard";
import { walkTalkSessionColumns } from "./WalkTalkSessionColumns";
import {
  WalkTalkSearchBar,
  WalkTalkSessionsHeader,
} from "./WalkTalkSessionsToolbar";

const LOG_ROUTE = "/dashboard/walk-talk/log";
const SESSION_ROUTE = "/dashboard/walk-talk/session";

export type WalkTalkRecentSessionsSectionProps = Readonly<{
  onStartWalkTalk?: () => void;
}>;

export function WalkTalkRecentSessionsSection(
  props: WalkTalkRecentSessionsSectionProps,
) {
  const { onStartWalkTalk } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_WALK_TALK_PAGE_NUMBER);

  const sessionsQuery = useWalkTalkSessionsQuery({
    pageNumber,
    pageSize: DEFAULT_WALK_TALK_PAGE_SIZE,
  });

  const totalRecords = sessionsQuery.data?.totalRecords ?? 0;
  const currentPageNumber = sessionsQuery.data?.pageNumber ?? pageNumber;
  const currentPageSize =
    sessionsQuery.data?.pageSize ?? DEFAULT_WALK_TALK_PAGE_SIZE;

  const filtered = useMemo(() => {
    const sessions = sessionsQuery.data?.sessions ?? [];
    const needle = query.trim().toLowerCase();
    if (needle === "") return sessions;

    return sessions.filter((session) =>
      [
        session.id,
        session.observer,
        session.focusArea,
        session.site,
        session.type,
      ].some((field) => field.toLowerCase().includes(needle)),
    );
  }, [sessionsQuery.data?.sessions, query]);

  const resultLabel = `${String(totalRecords)} ${
    totalRecords === 1 ? "session" : "sessions"
  }`;

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setPageNumber(DEFAULT_WALK_TALK_PAGE_NUMBER);
  };

  const handleStartWalkTalk = () => {
    if (onStartWalkTalk) {
      onStartWalkTalk();
      return;
    }
    router.push(LOG_ROUTE);
  };

  const openSession = (id: string) => {
    router.push(`${SESSION_ROUTE}?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <WalkTalkSearchBar
        value={query}
        onChange={handleQueryChange}
        resultLabel={resultLabel}
      />

      {sessionsQuery.isPending && !sessionsQuery.data ? (
        <div className="border-ehs-border flex items-center gap-2 rounded-2xl border bg-white/70 px-4 py-6">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-5 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading sessions...
          </Text>
        </div>
      ) : null}

      {sessionsQuery.isError ? (
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            sessionsQuery.error,
            "Could not load Walk & Talk sessions.",
          )}
        </Text>
      ) : null}

      {!sessionsQuery.isPending || sessionsQuery.data ? (
        <>
          {/* Mobile — card list (Figma 6415:34646) */}
          <div className="flex flex-col gap-3 md:hidden">
            <WalkTalkSessionsHeader onStartWalkTalk={handleStartWalkTalk} />
            {filtered.length === 0 ? (
              <p className="text-ehs-muted-text text-sm">No sessions found.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtered.map((session) => (
                  <li key={session.id}>
                    <WalkTalkSessionCard
                      session={session}
                      onClick={() => {
                        openSession(session.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
            {totalRecords > currentPageSize ? (
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={currentPageNumber <= 1 || sessionsQuery.isFetching}
                  onClick={() => {
                    setPageNumber((page) => Math.max(1, page - 1));
                  }}
                  className="text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer text-sm font-semibold disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-ehs-muted-text text-sm">
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
                  }}
                  className="text-ehs-normal-blue disabled:text-ehs-muted-text cursor-pointer text-sm font-semibold disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          {/* Desktop — table */}
          <div className="hidden min-w-0 md:block">
            <Table
              data={filtered}
              columns={walkTalkSessionColumns}
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                openSession(row.id);
              }}
              containerClassName="min-w-0"
              pagination={{
                pageNumber: currentPageNumber,
                pageSize: currentPageSize,
                totalRecords,
                onPageChange: setPageNumber,
                isLoading: sessionsQuery.isFetching,
              }}
              header={
                <WalkTalkSessionsHeader onStartWalkTalk={handleStartWalkTalk} />
              }
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
