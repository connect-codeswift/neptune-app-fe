"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { EditHazardForm } from "./EditHazardForm";
import { EditHazardHeader } from "./EditHazardHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord, toHazardApiId } from "@/lib/map-hazard";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export function EditHazardContent(props: Readonly<{ hazardId: string }>) {
  const { hazardId } = props;

  // userId / subCompanyId come from the signed-in user's access-token claims.
  const { userId, subCompanyId } = getCurrentUser();
  const detailQuery = useHazardDetailQuery(toHazardApiId(hazardId), {
    subCompanyId,
    userId,
  });

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapHazardDtoToRecord(dto) : null;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <div className="flex w-full flex-col gap-3.5 px-4 pb-8">
        {detailQuery.isPending && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading hazard...
          </Text>
        )}

        {detailQuery.isError && (
          <Text as="p" className="text-ehs-red text-sm">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this hazard.",
            )}
          </Text>
        )}

        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <div className="flex flex-col items-start gap-2">
            <Text as="p" className="text-ehs-muted-text text-sm">
              {`No hazard found for id ${hazardId}.`}
            </Text>
            <Link
              href={HAZARD_LIST_ROUTE}
              className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
            >
              Back to hazard reporting
            </Link>
          </div>
        )}

        {record && (
          <>
            <EditHazardHeader hazardId={record.id} />
            <EditHazardForm record={record} />
          </>
        )}
      </div>
    </div>
  );
}
