"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ModuleSearchBar } from "@/components/ui/ModuleSearchBar";
import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
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
    session.status,
    ...session.chemicals,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function HazcomTrainingLogPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useTrainingLogsQuery({ pageNumber, pageSize: DEFAULT_HAZCOM_PAGE_SIZE });

  /**
   * Page-scoped search: the training log endpoint takes only pageNumber and
   * pageSize, so this filters the rows already on screen.
   */
  const filteredSessions = useMemo(
    () => items.filter((session) => trainingMatchesSearch(session, searchQuery)),
    [items, searchQuery],
  );

  const resultLabel = `${String(filteredSessions.length)} ${
    filteredSessions.length === 1 ? "session" : "sessions"
  }`;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <HazcomModuleTabs />

      <HazcomPageHeader
        breadcrumb={["Safety", "HazCom", "Training Log"]}
        title="HazCom Training Log"
        subtitle="Record training sessions, attendees, chemicals covered, and digital sign-offs"
        actions={
          <Link href="/dashboard/hazcom/training/new">
            <Button type="button" variant="primary">
              <Icon icon="mdi:plus" className="text-base" aria-hidden="true" />
              Log Training Session
            </Button>
          </Link>
        }
      />

      <ModuleSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
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
          <HazcomTrainingLogTable sessions={filteredSessions} />
          <HazcomPager
            pageNumber={pageNumber}
            pageSize={DEFAULT_HAZCOM_PAGE_SIZE}
            totalRecords={totalRecords}
            isFetching={isFetching}
            onPageChange={setPageNumber}
          />
        </>
      ) : null}
    </div>
  );
}
