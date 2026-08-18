"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NearMissDetailHeader } from "@/components/near-miss/detail/NearMissDetailHeader";
import { NearMissDetailView } from "@/components/near-miss/detail/NearMissDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
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
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      {detailQuery.isPending && <SkeletonDetailPage />}

        {detailQuery.isError && (
          <Text as="p" className="text4 text-ehs-red">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this near miss.",
            )}
          </Text>
        )}

        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <Text as="p" className="text4 text-ehs-muted-text">
            {`No near miss found for id ${nearMissId}.`}
          </Text>
        )}

        {record ? (
          <>
            <NearMissDetailHeader
              record={record}
              action={
                <>
                  {canClose ? (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={isClosed || closeMutation.isPending}
                      onClick={handleClose}
                      className="text4 gap-2 rounded-2.5 px-4 py-2.5 font-semibold"
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
                      <Text as="span" className="text4 whitespace-nowrap">
                        {isClosed ? "Closed" : "Close Near Miss"}
                      </Text>
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="tertiary"
                    disabled={deleteMutation.isPending}
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text4 gap-2 rounded-2.5 px-4 py-2.5 font-semibold"
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
                    <Text as="span" className="text4 whitespace-nowrap">
                      Delete
                    </Text>
                  </Button>

                  {canConvert ? (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        router.push(
                          `/dashboard/near-miss/${encodeURIComponent(nearMissId)}/convert`,
                        )
                      }
                      className="text4 gap-2 rounded-2.5 px-4 py-2.5 font-semibold"
                    >
                      <Icon
                        icon="mdi:plus"
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <Text as="span" className="text4 whitespace-nowrap">
                        Convert to Incident
                      </Text>
                    </Button>
                  ) : null}
                </>
              }
            />
            <NearMissDetailView record={record} />
          </>
        ) : null}

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
