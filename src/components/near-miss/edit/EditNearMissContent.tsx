"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { EditNearMissForm } from "./EditNearMissForm";
import { EditNearMissHeader } from "./EditNearMissHeader";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { canEditNearMiss } from "@/lib/current-user";
import { mapNearMissDtoToRecord, toNearMissApiId } from "@/lib/map-near-miss";

const NEAR_MISS_LIST_ROUTE = "/dashboard/near-miss";

export function EditNearMissContent(props: Readonly<{ nearMissId: string }>) {
  const { nearMissId } = props;
  const router = useRouter();
  const apiId = toNearMissApiId(nearMissId);
  const detailQuery = useNearMissDetailQuery(apiId);

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapNearMissDtoToRecord(dto) : null;
  const detailRoute = `${NEAR_MISS_LIST_ROUTE}/${encodeURIComponent(apiId)}`;

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const allowed = canEditNearMiss();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setIsAllowed(allowed);
    if (!allowed) {
      router.replace(detailRoute);
    }
  }, [router, detailRoute]);

  if (isAllowed !== true) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      {detailQuery.isPending && <SkeletonFormPage fields={8} />}

      {detailQuery.isError && (
        <Text as="p" className="text4 text-ehs-red">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this near miss.",
          )}
        </Text>
      )}

      {!detailQuery.isPending && !detailQuery.isError && !record && (
        <div className="flex flex-col items-start gap-2">
          <Text as="p" className="text4 text-ehs-muted-text">
            {`No near miss found for id ${nearMissId}.`}
          </Text>
          <Link
            href={NEAR_MISS_LIST_ROUTE}
            className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover transition-colors"
          >
            Back to near-miss reporting
          </Link>
        </div>
      )}

      {record ? (
        <>
          <EditNearMissHeader nearMissId={record.id} />
          <EditNearMissForm record={record} />
        </>
      ) : null}
    </div>
  );
}
