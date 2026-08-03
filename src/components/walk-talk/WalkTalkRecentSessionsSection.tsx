"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { walkTalkSessionColumns } from "./WalkTalkSessionColumns";
import {
  WalkTalkSearchBar,
  WalkTalkSessionsHeader,
} from "./WalkTalkSessionsToolbar";
import type { WalkTalkSession } from "@/app/dashboard/walk-talk/walk-talk-data";

const LOG_ROUTE = "/dashboard/walk-talk/log";
const SESSION_ROUTE = "/dashboard/walk-talk/session";

export type WalkTalkRecentSessionsSectionProps = Readonly<{
  sessions: readonly WalkTalkSession[];
  onStartWalkTalk?: () => void;
}>;

export function WalkTalkRecentSessionsSection(
  props: WalkTalkRecentSessionsSectionProps,
) {
  const { sessions, onStartWalkTalk } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return [...sessions];

    return sessions.filter((session) =>
      [
        session.id,
        session.observer,
        session.focusArea,
        session.site,
        session.type,
      ].some((field) => field.toLowerCase().includes(needle)),
    );
  }, [sessions, query]);

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "session" : "sessions"
  }`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <WalkTalkSearchBar
        value={query}
        onChange={setQuery}
        resultLabel={resultLabel}
      />

      <Table
        data={filtered}
        columns={walkTalkSessionColumns}
        getRowId={(row) => row.id}
        selectedRowId={filtered[0]?.id ?? null}
        onRowClick={(row) => {
          router.push(
            `${SESSION_ROUTE}?id=${encodeURIComponent(row.id)}`,
          );
        }}
        containerClassName="min-w-0"
        header={
          <WalkTalkSessionsHeader
            onStartWalkTalk={() => {
              if (onStartWalkTalk) {
                onStartWalkTalk();
                return;
              }
              router.push(LOG_ROUTE);
            }}
          />
        }
      />
    </div>
  );
}
