"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useDeleteComplianceMutation,
  useMarkCompleteComplianceMutation,
} from "@/hooks/use-compliance-mutations";
import { useComplianceByIdQuery } from "@/hooks/use-compliance-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { parseRecordNumericId } from "@/lib/format-record-id";
import { toUserNameLookup } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildMarkCompleteSuccessMessage,
  formatComplianceDisplayId,
  normalizeComplianceUpdateResult,
} from "@/services/mappers/compliance.mapper";
import { RegulatoryComplianceDetailBannerCard } from "./RegulatoryComplianceDetailBannerCard";
import { RegulatoryComplianceObligationDetailsCard } from "./RegulatoryComplianceObligationDetailsCard";

export type RegulatoryComplianceDetailViewProps = Readonly<{
  id: string;
}>;

function parseComplianceId(raw: string): number | null {
  const parsed = parseRecordNumericId(raw);
  return parsed != null && parsed > 0 ? parsed : null;
}

export function RegulatoryComplianceDetailView(
  props: RegulatoryComplianceDetailViewProps,
) {
  const { id } = props;
  const router = useRouter();

  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const numericId = parseComplianceId(id);

  const usersQuery = useUserDropdownQuery();
  const responsibleNameById = useMemo(
    () => toUserNameLookup(usersQuery.data?.dataModel ?? []),
    [usersQuery.data?.dataModel],
  );

  const detailQuery = useComplianceByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken,
    responsibleNameById,
  });

  const markCompleteMutation = useMarkCompleteComplianceMutation();
  const deleteComplianceMutation = useDeleteComplianceMutation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const record = detailQuery.data;
  const detail = record?.detail ?? null;

  const handleMarkAsComplete = () => {
    if (!record || numericId == null) {
      return;
    }

    if (record.detail.status === "Compliant") {
      toast.info(
        "Already Completed",
        `Obligation ${formatComplianceDisplayId(record.detail.id)} has already been marked as complete.`,
      );
      return;
    }

    markCompleteMutation.mutate(numericId, {
      onSuccess: (response) => {
        const result = normalizeComplianceUpdateResult(response);
        const message = buildMarkCompleteSuccessMessage(
          formatComplianceDisplayId(record.detail.id),
          record.detail.title,
          result,
        );
        toast.success(message.title, message.description);
      },
      onError: (error) => {
        toast.error(
          "Could not mark as complete",
          getMutationErrorMessage(error, "Please try again."),
        );
      },
    });
  };

  const handleConfirmDelete = () => {
    if (numericId == null || !detail) {
      return;
    }

    deleteComplianceMutation.mutate(numericId, {
      onSuccess: () => {
        toast.success(
          "Compliance obligation deleted",
          `${formatComplianceDisplayId(detail.id)} (${detail.title}) was removed.`,
        );
        setIsConfirmingDelete(false);
        router.push("/dashboard/regulatory-compliance");
      },
      onError: (error) => {
        toast.error(
          "Could not delete obligation",
          getMutationErrorMessage(error, "Please try again."),
        );
      },
    });
  };

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady &&
    hasToken &&
    numericId != null &&
    detailQuery.isLoading &&
    detailQuery.data == null;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="bg-ehs-light-bg flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-darker">
          Sign in required
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          Please sign in to load this compliance obligation.
        </Text>
        <Link
          href="/dashboard/regulatory-compliance"
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to Compliance Register
        </Link>
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="bg-ehs-light-bg flex min-h-[50vh] flex-1 items-center justify-center px-4">
        <IncidentGlassCard
          className="min-h-55 text-center"
          incidentGlassCardClassName="items-center justify-center gap-2"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text4 text-ehs-darker">
            Could not load compliance obligation
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
            {getMutationErrorMessage(
              detailQuery.error,
              "Failed to load this obligation.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void detailQuery.refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  if (numericId == null || !detail) {
    return (
      <div className="bg-ehs-light-bg flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-darker">
          Obligation not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          {`No compliance obligation matches “${id}”.`}
        </Text>
        <Link
          href="/dashboard/regulatory-compliance"
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to Compliance Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <RegulatoryComplianceDetailBannerCard detail={detail} />

      <div className="mx-auto flex w-full max-w-175 justify-center">
        <RegulatoryComplianceObligationDetailsCard
          detail={detail}
          onMarkAsComplete={handleMarkAsComplete}
          onDelete={() => setIsConfirmingDelete(true)}
          isMarkingComplete={markCompleteMutation.isPending}
          isDeleting={deleteComplianceMutation.isPending}
        />
      </div>

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete compliance obligation?"
        description={`${formatComplianceDisplayId(detail.id)} (${detail.title}) will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        isConfirming={deleteComplianceMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleteComplianceMutation.isPending) {
            setIsConfirmingDelete(false);
          }
        }}
      />
    </div>
  );
}
