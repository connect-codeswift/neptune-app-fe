"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NearMissDetailView } from "@/components/near-miss/detail/NearMissDetailView";
import { ReportNearMissHeader } from "@/components/near-miss/report/ReportNearMissHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCloseNearMissMutation,
  useDeleteNearMissMutation,
} from "@/hooks/use-near-miss-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  canCloseNearMiss,
  canConvertNearMissToIncident,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  formatNearMissDisplayId,
  mapNearMissDtoToRecord,
} from "@/lib/map-near-miss";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";

export type NearMissDetailContentProps = Readonly<{
  nearMissId: string;
}>;

export function NearMissDetailContent(
  props: Readonly<NearMissDetailContentProps>,
) {
  const { nearMissId } = props;
  const router = useRouter();
  const detailQuery = useNearMissDetailQuery(nearMissId);
  const dto = detailQuery.data?.dataModel ?? null;

  // The record carries a userId, not a reporter name — resolve it for display.
  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const mapped = dto ? mapNearMissDtoToRecord(dto) : null;
  const record = mapped
    ? { ...mapped, reporter: userNameFor(userNames, mapped.reporterId ?? "") }
    : null;

  // Resolve the role after mount: the token lives in localStorage, so reading
  // it during render would mismatch the server-rendered HTML.
  const [canConvert, setCanConvert] = useState(false);
  const [canClose, setCanClose] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanConvert(canConvertNearMissToIncident());
    setCanClose(canCloseNearMiss());
  }, []);

  const closeMutation = useCloseNearMissMutation();
  const deleteMutation = useDeleteNearMissMutation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isClosed = record?.status === "Closed";

  const handleConfirmDelete = () => {
    deleteMutation.mutate(nearMissId, {
      onSuccess: () => {
        // The mutation already invalidated the near-miss queries, so the list
        // refetches as we land on it.
        toast.success(`${formatNearMissDisplayId(nearMissId)} deleted`);
        setIsConfirmingDelete(false);
        router.push(NEAR_MISS_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not delete the near miss. Please try again.",
          ),
        );
      },
    });
  };

  const handleClose = () => {
    closeMutation.mutate(nearMissId, {
      onSuccess: () => {
        // The mutation already invalidated the near-miss queries, so the list
        // refetches as we land on it.
        toast.success("Near miss closed");
        router.push(NEAR_MISS_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not close the near miss. Please try again.",
          ),
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />
      <div className="mx-auto flex w-full flex-col gap-5 px-4 pb-8">
        <ReportNearMissHeader
          action={
            <div className="flex flex-wrap items-center gap-3">
              {canClose && record ? (
                <Button
                  type="button"
                  variant="primary"
                  disabled={isClosed || closeMutation.isPending}
                  onClick={handleClose}
                  className="gap-2 rounded-[10px] px-4 py-2.5"
                >
                  <Icon
                    icon={
                      closeMutation.isPending
                        ? "mdi:loading"
                        : "mdi:check-circle-outline"
                    }
                    className={[
                      "size-4 shrink-0",
                      closeMutation.isPending ? "animate-spin" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold whitespace-nowrap">
                    {isClosed ? "Closed" : "Close Near Miss"}
                  </span>
                </Button>
              ) : null}

              {record ? (
                <Button
                  type="button"
                  variant="tertiary"
                  disabled={deleteMutation.isPending}
                  onClick={() => setIsConfirmingDelete(true)}
                  className="gap-2 rounded-[10px] px-4 py-2.5"
                >
                  <Icon
                    icon={
                      deleteMutation.isPending
                        ? "mdi:loading"
                        : "mdi:trash-can-outline"
                    }
                    className={[
                      "size-4 shrink-0",
                      deleteMutation.isPending ? "animate-spin" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold whitespace-nowrap">
                    Delete
                  </span>
                </Button>
              ) : null}

              {canConvert ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    router.push(
                      `/dashboard/near-miss/${encodeURIComponent(nearMissId)}/convert`,
                    )
                  }
                  className="gap-2 rounded-[10px] px-4 py-2.5"
                >
                  <Icon
                    icon="mdi:plus"
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold whitespace-nowrap">
                    Convert to Incident
                  </span>
                </Button>
              ) : null}
            </div>
          }
        />

        {detailQuery.isPending && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading near miss...
          </Text>
        )}

        {detailQuery.isError && (
          <Text as="p" className="text-ehs-red text-sm">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this near miss.",
            )}
          </Text>
        )}

        {/* Request succeeded but the record isn't there. */}
        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            {`No near miss found for id ${nearMissId}.`}
          </Text>
        )}

        {record && <NearMissDetailView record={record} />}
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete near miss?"
        description={`${formatNearMissDisplayId(nearMissId)} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleteMutation.isPending) setIsConfirmingDelete(false);
        }}
      />
    </div>
  );
}
