"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HazardDetailHeader } from "./HazardDetailHeader";
import { HazardDetailView } from "./HazardDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCloseHazardMutation,
  useDropHazardMutation,
} from "@/hooks/use-hazard-mutations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  canCloseHazard,
  canEditHazard,
  getCurrentUser,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  formatHazardDisplayId,
  mapHazardDtoToRecord,
  toHazardApiId,
} from "@/lib/map-hazard";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export type HazardDetailContentProps = Readonly<{ hazardId: string }>;

export function HazardDetailContent(props: HazardDetailContentProps) {
  const { hazardId } = props;
  const router = useRouter();

  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();
  const detailQuery = useHazardDetailQuery(toHazardApiId(hazardId), {
    siteId,
    userId,
  });

  // The record carries a userId, not a reporter name — resolve it for display.
  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const dto = detailQuery.data?.dataModel ?? null;
  const mapped = dto ? mapHazardDtoToRecord(dto) : null;
  const record = mapped
    ? { ...mapped, reporter: userNameFor(userNames, mapped.reporterId ?? "") }
    : null;

  // Resolve the role after mount: the token lives in localStorage, so reading
  // it during render would mismatch the server-rendered HTML.
  const [canEdit, setCanEdit] = useState(false);
  const [canClose, setCanClose] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanEdit(canEditHazard());
    setCanClose(canCloseHazard());
  }, []);

  const closeMutation = useCloseHazardMutation();
  const dropMutation = useDropHazardMutation();

  const [isConfirmingDrop, setIsConfirmingDrop] = useState(false);
  const isClosed = record?.status === "Closed";

  const handleClose = () => {
    closeMutation.mutate(toHazardApiId(hazardId), {
      onSuccess: () => {
        toast.success("Hazard closed successfully");
        router.push(HAZARD_LIST_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            "Could not close the hazard. Please try again.",
          ),
        );
      },
    });
  };

  const handleConfirmDrop = () => {
    dropMutation.mutate(
      {
        id: toHazardApiId(hazardId),
        siteId,
        userId,
      },
      {
        onSuccess: () => {
          toast.success("Hazard dropped successfully");
          setIsConfirmingDrop(false);
          router.push(HAZARD_LIST_ROUTE);
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not drop the hazard. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-2">
      <DashboardHeader title="Hazard Reporting Detail" />

      <div className="flex w-full flex-col gap-3.5 px-4 pb-8">
        {detailQuery.isPending && <SkeletonDetailPage />}

        {detailQuery.isError && (
          <Text as="p" className="text4 text-ehs-red">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this hazard.",
            )}
          </Text>
        )}

        {/* Request succeeded but the record isn't there. */}
        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <div className="flex flex-col items-start gap-2">
            <Text as="p" className="text4 text-ehs-muted-text">
              {`No hazard found for id ${hazardId}.`}
            </Text>
            <Link
              href={HAZARD_LIST_ROUTE}
              className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover transition-colors"
            >
              Back to hazard reporting
            </Link>
          </div>
        )}

        {record && (
          <>
            <HazardDetailHeader
              record={record}
              canEdit={canEdit}
              editHref={`${HAZARD_LIST_ROUTE}/${encodeURIComponent(record.id)}/edit`}
              action={
                <div className="flex flex-wrap items-center gap-3">
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
                      <span className="whitespace-nowrap">
                        {isClosed ? "Closed" : "Close Hazard"}
                      </span>
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="tertiary"
                    disabled={dropMutation.isPending}
                    onClick={() => setIsConfirmingDrop(true)}
                    className="text4 gap-2 rounded-2.5 px-4 py-2.5 font-semibold"
                  >
                    <Icon
                      icon={
                        dropMutation.isPending
                          ? "mdi:loading"
                          : "mdi:trash-can-outline"
                      }
                      className={[
                        "size-4 shrink-0",
                        dropMutation.isPending ? "animate-spin" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">Drop Hazard</span>
                  </Button>
                </div>
              }
            />
            <HazardDetailView record={record} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmingDrop}
        title="Drop hazard?"
        description={`${formatHazardDisplayId(hazardId)} will be permanently dropped. This can't be undone.`}
        confirmLabel="Drop"
        isConfirming={dropMutation.isPending}
        onConfirm={handleConfirmDrop}
        onCancel={() => {
          if (!dropMutation.isPending) setIsConfirmingDrop(false);
        }}
      />
    </div>
  );
}
