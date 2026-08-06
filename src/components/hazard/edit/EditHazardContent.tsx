"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { EditHazardForm } from "./EditHazardForm";
import { EditHazardHeader } from "./EditHazardHeader";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { canEditHazard, getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord, toHazardApiId } from "@/lib/map-hazard";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export function EditHazardContent(props: Readonly<{ hazardId: string }>) {
  const { hazardId } = props;
  const router = useRouter();

  // userId / siteId come from the signed-in user's access-token claims.
  const { userId, siteId } = getCurrentUser();
  const detailQuery = useHazardDetailQuery(toHazardApiId(hazardId), {
    siteId,
    userId,
  });

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapHazardDtoToRecord(dto) : null;

  const detailRoute = `${HAZARD_LIST_ROUTE}/${encodeURIComponent(hazardId)}`;

  // Resolve the role after mount: the token lives in localStorage, so reading
  // it during render would mismatch the server-rendered HTML.
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const allowed = canEditHazard();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setIsAllowed(allowed);
    if (!allowed) {
      router.replace(detailRoute);
    }
  }, [router, detailRoute]);

  if (isAllowed !== true) {
    // Render nothing while resolving or before the redirect lands.
    return null;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"      />

      <div className="flex w-full flex-col gap-3.5 px-4 pb-8">
        {detailQuery.isPending && (
          <SkeletonFormPage fields={8} />
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
