"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { bbsSessionColumns } from "./BbsSessionColumns";
import { BbsSearchBar, BbsSessionsHeader } from "./BbsSessionsToolbar";
import type { BbsSession } from "@/app/dashboard/bbs/bbs-data";

export type BbsRecentSessionsSectionProps = Readonly<{
  sessions: readonly BbsSession[];
  onLogObservation?: () => void;
}>;

export function BbsRecentSessionsSection(props: BbsRecentSessionsSectionProps) {
  const { sessions, onLogObservation } = props;
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return [...sessions];

    return sessions.filter((session) =>
      [session.id, session.observer, session.location, session.type].some(
        (field) => field.toLowerCase().includes(needle),
      ),
    );
  }, [sessions, query]);

  const resultLabel = `${String(filtered.length)} ${
    filtered.length === 1 ? "chemical" : "chemicals"
  }`;

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      <BbsSearchBar
        value={query}
        onChange={setQuery}
        resultLabel={resultLabel}
      />

      <Table
        data={filtered}
        columns={bbsSessionColumns}
        getRowId={(row) => row.id}
        onRowClick={(row) => {
          router.push(
            `/dashboard/bbs/observation?id=${encodeURIComponent(row.id)}`,
          );
        }}
        containerClassName="min-w-0"
        header={
          <BbsSessionsHeader
            onLogObservation={() => {
              if (onLogObservation) {
                onLogObservation();
                return;
              }
              router.push("/dashboard/bbs/log");
            }}
          />
        }
      />
    </div>
  );
}
