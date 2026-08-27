"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { NearMissDetailHeader } from "@/components/near-miss/detail/NearMissDetailHeader";
import { NearMissDetailView } from "@/components/near-miss/detail/NearMissDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  AddCapaModal,
  type CapaFormPayload,
} from "@/components/incidents/shared/capa/AddCapaModal";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { buildCreateCapaRequest } from "@/services/mappers/capa.mapper";
import { useCloseNearMissMutation } from "@/hooks/use-near-miss-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  canCloseNearMiss,
  canConvertNearMissToIncident,
  canEditNearMiss,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import { mapNearMissDtoToRecord, toNearMissApiId } from "@/lib/map-near-miss";
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

  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);
  const createCapaMutation = useCreateCapaMutation();

  // Same modal and same payload the incident module uses; only the source pair differs, so
  // the CAPA links back to this near miss rather than saving as Standalone.
  const handleSubmitCapa = async (payload: CapaFormPayload) => {
    try {
      await createCapaMutation.mutateAsync({
        payload: buildCreateCapaRequest({
          sourceType: "NearMiss",
          sourceId: Number(apiId) || 0,
          controlLevel: payload.controlLevel,
          description: payload.description,
          type: payload.type,
          owner: payload.owner,
          dueDate: payload.dueDate,
          priority: payload.priority,
        }),
        tasks: payload.tasks,
      });
      const taskCount = payload.tasks?.length ?? 0;
      toast.success(
        "CAPA created",
        `Added ${payload.type.toLowerCase()} action with ${String(taskCount)} task${taskCount === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      toast.error(
        "Could not create CAPA",
        getMutationErrorMessage(error, "Please try again."),
      );
      throw error;
    }
  };

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
                    className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-semibold"
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
                    className="text4 rounded-2.5 gap-2 px-4 py-2.5 font-semibold"
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
          <NearMissDetailView
            record={record}
            onAddCapa={() => setIsAddCapaOpen(true)}
          />

          {isAddCapaOpen ? (
            <AddCapaModal
              sourceLabel={record.id}
              sourceTitle={record.hazardType}
              isSubmitting={createCapaMutation.isPending}
              onClose={() => setIsAddCapaOpen(false)}
              onSubmit={handleSubmitCapa}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
