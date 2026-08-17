"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { CapaDetailRecord } from "@/components/capa/detail/capa-detail-data";
import { capaQueryKeys } from "@/hooks/use-capa-queries";
import {
  useDropCapaMutation,
  useReopenCapaMutation,
} from "@/hooks/use-capa-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { isCapaStatusClosed, isCapaStatusPending } from "@/lib/capa-filters";
import { getCapaVerificationByCapaId } from "@/services/capa.service";
import { getCapaRcaById } from "@/services/rca.service";
import { toast } from "@/lib/toast";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-[#566072]";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-[#8892a3] transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="size-2.75 shrink-0 text-[#8892a3]"
      aria-hidden
    />
  );
}

export type CapaDetailHeaderProps = Readonly<{
  record: CapaDetailRecord;
}>;

/** CAPA detail page header — Figma 1366:2948. */
export function CapaDetailHeader(props: CapaDetailHeaderProps) {
  const { record } = props;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpeningVerify, setIsOpeningVerify] = useState(false);
  const [isOpeningRca, setIsOpeningRca] = useState(false);
  const [isConfirmingDrop, setIsConfirmingDrop] = useState(false);
  const dropCapaMutation = useDropCapaMutation();
  const reopenCapaMutation = useReopenCapaMutation();

  const isClosed = isCapaStatusClosed(record.statusLabel);
  const canReopen = isCapaStatusPending(record.statusLabel);
  const isBusy =
    isOpeningRca ||
    isOpeningVerify ||
    dropCapaMutation.isPending ||
    reopenCapaMutation.isPending;

  const verifyHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}/verify`;
  const rcaHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}/rca`;

  async function handleVerifyAndClose() {
    if (record.numericId <= 0) {
      router.push(verifyHref);
      return;
    }

    setIsOpeningVerify(true);
    try {
      // Prefetch GET /api/CAPA/Verification/{capaId} before opening the page.
      await queryClient.prefetchQuery({
        queryKey: capaQueryKeys.verification(record.numericId),
        queryFn: () => getCapaVerificationByCapaId(record.numericId),
      });
      router.push(verifyHref);
    } catch (error) {
      toast.error(
        "Could not open verification",
        getMutationErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsOpeningVerify(false);
    }
  }

  async function handleOpenRca() {
    const rcaId = record.rcaId;
    if (rcaId == null || rcaId <= 0) {
      toast.error("RCA is null", "No RCA is linked to this CAPA.");
      return;
    }

    setIsOpeningRca(true);
    try {
      // Prefetch GET /api/CAPA/Rca/{rcaId} before opening the page.
      await queryClient.prefetchQuery({
        queryKey: capaQueryKeys.rca(rcaId),
        queryFn: () => getCapaRcaById(rcaId),
      });
      router.push(rcaHref);
    } catch (error) {
      toast.error(
        "Could not open RCA",
        getMutationErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsOpeningRca(false);
    }
  }

  async function handleReopen() {
    if (record.numericId <= 0) {
      toast.error(
        "Could not reopen CAPA",
        "This CAPA is missing a server id. Refresh and try again.",
      );
      return;
    }

    try {
      await reopenCapaMutation.mutateAsync({ capaId: record.numericId });
      toast.success("CAPA reopened");
    } catch (error) {
      toast.error(
        "Could not reopen CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  }

  function handleConfirmDrop() {
    if (record.numericId <= 0) {
      toast.error(
        "Could not drop CAPA",
        "This CAPA is missing a server id. Refresh and try again.",
      );
      return;
    }

    dropCapaMutation.mutate(
      { capaId: record.numericId },
      {
        onSuccess: () => {
          toast.success("CAPA dropped");
          setIsConfirmingDrop(false);
          router.push(CAPA_ROUTE);
        },
        onError: (error) => {
          toast.error(
            "Could not drop CAPA",
            getMutationErrorMessage(error, "Please try again."),
          );
        },
      },
    );
  }

  return (
    <>
      <div className="backdrop-blur-2.5 relative flex flex-col gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-4 pt-3.5 pb-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] sm:px-5.5">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 overflow-x-auto md:flex"
          >
            <span className={crumbMuted}>Compliance</span>
            <Chevron />
            <Link href={CAPA_ROUTE} className={crumbLink}>
              CAPA
            </Link>
            <Chevron />
            <span className={crumbMuted}>{record.code}</span>
          </nav>

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href={CAPA_ROUTE}
                aria-label="Back to CAPA Dashboard"
                className="border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 items-center justify-center border bg-white transition-colors hover:bg-slate-50 md:hidden"
              >
                <Icon icon="mdi:chevron-left" className="size-3.5" />
              </Link>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Text
                    as="h1"
                    className="text-5.5 leading-7 font-semibold tracking-[-0.2px] text-[#0b1320]"
                  >
                    {record.code}
                  </Text>
                  <span className="text-2.75 inline-flex items-center rounded-md bg-[rgba(239,68,68,0.16)] px-2 py-0.5 font-semibold tracking-[0.11px] text-[#7f1d1d]">
                    {record.priority}
                  </span>
                </div>
                <Text as="p" className="text-sm leading-4.5 text-[#8892a3]">
                  {record.title}
                </Text>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
              <Button
                type="button"
                variant="secondary"
                isLoading={isOpeningRca}
                disabled={isBusy}
                onClick={() => {
                  void handleOpenRca();
                }}
                className="rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-[#EEF1F6]! px-4 py-2 font-normal! text-[#2a3446] shadow-none hover:bg-[#e5eaf0] sm:px-6"
              >
                RCA
              </Button>
              {canReopen ? (
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={reopenCapaMutation.isPending}
                  disabled={isBusy}
                  onClick={() => {
                    void handleReopen();
                  }}
                  className="rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-[#EEF1F6]! px-4 py-2 font-normal! text-[#2a3446] shadow-none hover:bg-[#e5eaf0] sm:px-6"
                >
                  Reopen
                </Button>
              ) : null}
              {isClosed ? null : (
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isOpeningVerify}
                  disabled={isBusy}
                  onClick={() => {
                    void handleVerifyAndClose();
                  }}
                  className="rounded-2.5 before:rounded-2.5 relative bg-[#0891a6] px-3 py-0 font-medium text-white shadow-[0px_6px_18px_-6px_#0891a6] before:pointer-events-none before:absolute before:inset-0 before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.25)] before:content-[''] hover:bg-[#078395]"
                >
                  Verify & Close
                </Button>
              )}
              <Button
                type="button"
                variant="tertiary"
                disabled={isBusy}
                onClick={() => setIsConfirmingDrop(true)}
                className="rounded-2.5 px-4 py-2 font-normal! text-[#2a3446]"
              >
                Drop
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={isConfirmingDrop}
        title="Drop CAPA?"
        description={`${record.code} will be dropped from the register. This can't be undone.`}
        confirmLabel="Drop"
        isConfirming={dropCapaMutation.isPending}
        onConfirm={handleConfirmDrop}
        onCancel={() => {
          if (!dropCapaMutation.isPending) setIsConfirmingDrop(false);
        }}
      />
    </>
  );
}
