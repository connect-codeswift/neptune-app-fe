"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { EditHazardForm } from "./EditHazardForm";
import { EditHazardHeader } from "./EditHazardHeader";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { canEditHazard, getCurrentUser } from "@/lib/current-user";
import { mapHazardDtoToRecord, toHazardApiId } from "@/lib/map-hazard";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

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

  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const dto = detailQuery.data?.dataModel ?? null;
  const mapped = dto ? mapHazardDtoToRecord(dto) : null;
  const record = mapped
    ? {
        ...mapped,
        assignedTo:
          mapped.assignedToId != null && mapped.assignedToId > 0
            ? userNameFor(userNames, mapped.assignedToId)
            : mapped.assignedTo,
      }
    : null;

  const isPending = detailQuery.isPending || userDropdownQuery.isPending;

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
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      {isPending && <SkeletonFormPage fields={8} />}

      {!isPending && detailQuery.isError && (
        <Text as="p" className="text4 text-ehs-red">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this hazard.",
          )}
        </Text>
      )}

      {!isPending && !detailQuery.isError && !record && (
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

      {!isPending && record ? (
        <>
          <EditHazardHeader hazardId={record.id} />
          <EditHazardForm record={record} />
        </>
      ) : null}
    </div>
  );
}
