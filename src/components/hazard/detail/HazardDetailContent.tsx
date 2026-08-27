"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { HazardDetailHeader } from "./HazardDetailHeader";
import { HazardDetailView } from "./HazardDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  AddCapaModal,
  type CapaFormPayload,
} from "@/components/incidents/shared/capa/AddCapaModal";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { buildCreateCapaRequest } from "@/services/mappers/capa.mapper";
import { useCloseHazardMutation } from "@/hooks/use-hazard-mutations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import {
  canCloseHazard,
  canEditHazard,
  getCurrentUser,
} from "@/lib/current-user";
import { toast } from "@/lib/toast";
import { mapHazardDtoToRecord, toHazardApiId } from "@/lib/map-hazard";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export type HazardDetailContentProps = Readonly<{ hazardId: string }>;

export function HazardDetailContent(props: HazardDetailContentProps) {
  const { hazardId } = props;
  const router = useRouter();

  const { userId, siteId } = getCurrentUser();
  const detailQuery = useHazardDetailQuery(toHazardApiId(hazardId), {
    siteId,
    userId,
  });

  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const dto = detailQuery.data?.dataModel ?? null;
  const mapped = dto ? mapHazardDtoToRecord(dto) : null;
  const record = mapped
    ? {
        ...mapped,
        reporter: userNameFor(userNames, mapped.reporterId ?? ""),
      }
    : null;

  const [canEdit, setCanEdit] = useState(false);
  const [canClose, setCanClose] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanEdit(canEditHazard());
    setCanClose(canCloseHazard());
  }, []);

  const closeMutation = useCloseHazardMutation();
  const isClosed = record?.status === "Closed";

  const [isAddCapaOpen, setIsAddCapaOpen] = useState(false);
  const createCapaMutation = useCreateCapaMutation();

  // Same modal and same payload the incident module uses; only the source pair differs, so
  // the CAPA links back to this hazard rather than saving as Standalone.
  const handleSubmitCapa = async (payload: CapaFormPayload) => {
    try {
      await createCapaMutation.mutateAsync({
        payload: buildCreateCapaRequest({
          sourceType: "Hazard",
          // toHazardApiId strips the "HZ-" prefix but returns a string; the source pair is
          // numeric on the wire.
          sourceId: Number(toHazardApiId(hazardId)) || 0,
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

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      {detailQuery.isPending && <SkeletonDetailPage />}

      {detailQuery.isError && (
        <Text as="p" className="text4 text-ehs-red">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this hazard.",
          )}
        </Text>
      )}

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

      {record ? (
        <>
          <HazardDetailHeader
            record={record}
            canEdit={canEdit}
            editHref={`${HAZARD_LIST_ROUTE}/${encodeURIComponent(record.id)}/edit`}
            action={
              canClose ? (
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
                    {isClosed ? "Closed" : "Close Hazard"}
                  </Text>
                </Button>
              ) : null
            }
          />
          <HazardDetailView
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
