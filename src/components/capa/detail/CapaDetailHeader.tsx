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
import { useDropCapaMutation } from "@/hooks/use-capa-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { isCapaStatusClosed } from "@/lib/capa-filters";
import { getCapaVerificationByCapaId } from "@/services/capa.service";
import { getCapaRcaById } from "@/services/rca.service";
import { toast } from "@/lib/toast";

const CAPA_ROUTE = "/dashboard/capa";

const crumbMuted = "text-sm font-medium leading-[16.5px] text-ehs-gray";
const crumbLink =
  "text-sm font-medium leading-[16.5px] text-ehs-muted-text transition-colors hover:text-ehs-gray";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-2.75 shrink-0"
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

  const isClosed = isCapaStatusClosed(record.statusLabel);
  const isBusy = isOpeningRca || isOpeningVerify || dropCapaMutation.isPending;

  const verifyHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}/verify`;
  const rcaHref = `${CAPA_ROUTE}/${encodeURIComponent(String(record.numericId || record.id))}/rca`;

  async function handleVerifyAndClose() {
    if (record.numericId <= 0) {
      router.push(verifyHref);
      return;
    }

    setIsOpeningVerify(true);
    try {
      // Prefetch GET /api/v1/capas/{capaId}/verification before opening the page.
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
      // Prefetch GET /api/v1/rcas/{rcaId}/capas before opening the page.
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
      <div className="backdrop-blur-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 relative flex flex-col gap-1.5 rounded-2xl border px-4 pt-3.5 pb-4 shadow-(--ehs-shadow-panel) before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:content-[''] sm:px-5.5">
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
                className="border-ehs-border text-ehs-dark-bg bg-ehs-surface hover:bg-ehs-surface-raised rounded-2.5 flex size-8 shrink-0 items-center justify-center border transition-colors md:hidden"
              >
                <Icon icon="mdi:chevron-left" className="size-3.5" />
              </Link>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Text
                    as="h1"
                    className="text-ehs-dark-bg text-5.5 leading-7 font-semibold tracking-[-0.2px]"
                  >
                    {record.code}
                  </Text>
                  <span className="bg-ehs-red/16 text-ehs-red-ink text-2.75 inline-flex items-center rounded-md px-2 py-0.5 font-semibold tracking-[0.11px]">
                    {record.priority}
                  </span>
                </div>
                <Text
                  as="p"
                  className="text-ehs-muted-text text-sm leading-4.5"
                >
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
                className="border-ehs-border-ink/10 bg-ehs-form-classes-bg! text-ehs-slate hover:bg-ehs-light-blue! rounded-2.5 border px-4 py-2 font-normal! shadow-none sm:px-6"
              >
                RCA
              </Button>
              {isClosed ? null : (
                <Button
                  type="button"
                  variant="primary"
                  isLoading={isOpeningVerify}
                  disabled={isBusy}
                  onClick={() => {
                    void handleVerifyAndClose();
                  }}
                  className="rounded-2.5 px-3 py-0 font-medium"
                >
                  Verify & Close
                </Button>
              )}
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
