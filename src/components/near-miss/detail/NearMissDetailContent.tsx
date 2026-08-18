"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { NearMissDetailHeader } from "@/components/near-miss/detail/NearMissDetailHeader";
import { NearMissDetailView } from "@/components/near-miss/detail/NearMissDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCloseNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  canCloseNearMiss,
  canConvertNearMissToIncident,
  canEditNearMiss,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import {
  mapNearMissDtoToRecord,
  toNearMissApiId,
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
  const apiId = toNearMissApiId(nearMissId);
  const detailQuery = useNearMissDetailQuery(apiId);
  const dto = detailQuery.data?.dataModel ?? null;

  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const mapped = dto ? mapNearMissDtoToRecord(dto) : null;
  const record = mapped
    ? { ...mapped, reporter: userNameFor(userNames, mapped.reporterId ?? "") }
    : null;

  const [canConvert, setCanConvert] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanConvert(canConvertNearMissToIncident());
    setCanClose(canCloseNearMiss());
    setCanEdit(canEditNearMiss());
  }, []);

  const closeMutation = useCloseNearMissMutation();
  const isClosed = record?.status === "Closed";

  const handleClose = () => {
    closeMutation.mutate(apiId, {
      onSuccess: () => {
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
            canEdit={canEdit}
            editHref={`${NEAR_MISS_LIST_ROUTE}/${encodeURIComponent(record.id)}/edit`}
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

                {canConvert && !isClosed ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      router.push(
                        `/dashboard/near-miss/${encodeURIComponent(record.id)}/convert`,
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
    </div>
  );
}
