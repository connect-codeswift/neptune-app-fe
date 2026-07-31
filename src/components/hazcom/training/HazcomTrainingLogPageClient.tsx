"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  HazcomErrorCard,
  HazcomLoadingCard,
  HazcomModuleTabs,
  HazcomPageHeader,
  HazcomPager,
} from "@/components/hazcom/shared";
import { HazcomTrainingLogTable } from "@/components/hazcom/training/HazcomTrainingLogTable";
import {
  DEFAULT_HAZCOM_PAGE_NUMBER,
  DEFAULT_HAZCOM_PAGE_SIZE,
  useTrainingLogsQuery,
} from "@/hooks/use-hazcom-queries";

export function HazcomTrainingLogPageClient() {
  const [pageNumber, setPageNumber] = useState(DEFAULT_HAZCOM_PAGE_NUMBER);

  const { items, totalRecords, isLoading, isFetching, errorMessage, refetch } =
    useTrainingLogsQuery({ pageNumber, pageSize: DEFAULT_HAZCOM_PAGE_SIZE });

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
          <HazcomTrainingLogTable sessions={items} />
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
