"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { usePpeIssueDetailQuery } from "@/hooks/use-ppe-queries";

export type PpeIssuanceDetailModalProps = Readonly<{
  open: boolean;
  /** Issue id for GET /api/ppe/issue/{id}. */
  issueId: string | null;
  onClose: () => void;
}>;

function DetailField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

function ModalBodySkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={`issue-detail-sk-${String(index)}`} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

/** Fetches and shows one issuance from GET /api/ppe/issue/{id}. */
export function PpeIssuanceDetailModal(
  props: Readonly<PpeIssuanceDetailModalProps>,
) {
  const { open, issueId, onClose } = props;
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const { detail, isLoading, errorMessage, isNotFound } =
    usePpeIssueDetailQuery(open && issueId ? issueId : "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open || !issueId) {
    return null;
  }

  const title = detail?.employee ?? "Issuance details";
  const subtitle = detail?.item?.trim()
    ? `Issued PPE · ${detail.item}`
    : "Issued PPE details";

  return createPortal(
    <div
      className="bg-ehs-dark-bg/45 fixed inset-0 z-[100] flex items-center justify-center p-3.5 backdrop-blur-0.75 sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="bg-ehs-light-bg flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
        <header className="border-ehs-border relative shrink-0 border-b px-4 py-4 sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-start justify-between gap-3 pr-10">
            <div className="min-w-0">
              <Text
                as="h2"
                id={titleId}
                className="text3 text-ehs-dark-bg truncate"
              >
                {isLoading && !detail ? "Loading…" : title}
              </Text>
              <Text as="p" className="text8 text-ehs-muted-text mt-0.5 truncate">
                {isLoading && !detail ? "Fetching issuance" : subtitle}
              </Text>
            </div>
            {detail ? (
              <IncidentBadge
                label={detail.status}
                tone="muted"
                className="shrink-0"
              />
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg bg-white/40 transition-colors hover:bg-white/70 sm:top-6 sm:right-6"
          >
            <Icon
              icon="mdi:close"
              className="size-4 text-slate-500"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isLoading && !detail ? <ModalBodySkeleton /> : null}

          {!isLoading && errorMessage ? (
            <Text as="p" className="text4 text-ehs-red">
              {errorMessage}
            </Text>
          ) : null}

          {!isLoading && isNotFound ? (
            <Text as="p" className="text4 text-ehs-muted-text">
              This issuance could not be found.
            </Text>
          ) : null}

          {detail ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                <DetailField label="Item" value={detail.item} />
                <DetailField label="Role" value={detail.role} />
                <DetailField
                  label="Quantity"
                  value={String(detail.quantity)}
                />
                <DetailField label="Size" value={detail.size} />
                <DetailField label="Issue date" value={detail.issueDate} />
                <DetailField label="Status" value={detail.status} />
                <DetailField
                  label="Acknowledgement"
                  value={
                    detail.employeeAcknowledged
                      ? "Acknowledged"
                      : "Not acknowledged"
                  }
                />
              </div>

              <div className="mt-5 flex flex-col gap-1.5">
                <Text as="p" className="text9 text-ehs-muted-text">
                  Description
                </Text>
                <Text as="p" className="text4 text-ehs-slate whitespace-pre-wrap">
                  {detail.note || "No description provided."}
                </Text>
              </div>
            </>
          ) : null}
        </div>

        <footer className="border-ehs-border flex shrink-0 justify-end border-t px-4 py-3.5 sm:px-6">
          <Button
            type="button"
            variant="tertiary"
            onClick={onClose}
            className="text4 rounded-lg px-4 py-2 font-medium"
          >
            Close
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
