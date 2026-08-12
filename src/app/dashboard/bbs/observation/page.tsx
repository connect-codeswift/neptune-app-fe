"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { ObservationDetailContent } from "@/components/bbs/observation/ObservationDetailContent";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  toBbsObservationApiId,
  useBbsObservationDetailQuery,
} from "@/hooks/use-bbs-queries";
import { toObservationDetail } from "@/lib/map-bbs";

const BBS_ROUTE = "/dashboard/bbs";

/** Reads the id from `?id=`, so it needs a Suspense boundary. */
function ObservationDetail() {
  const searchParams = useSearchParams();
  const id = decodeURIComponent(searchParams.get("id") ?? "");
  const apiId = toBbsObservationApiId(id);
  const observationQuery = useBbsObservationDetailQuery(id || null);

  if (apiId === null) {
    return (
      <div className="bg-ehs-light-bg flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-darker">
          Observation not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          That observation could not be found.
        </Text>
        <Link
          href={BBS_ROUTE}
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to BBS
        </Link>
      </div>
    );
  }

  if (observationQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (observationQuery.isError || !observationQuery.data?.dataModel) {
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
            Could not load observation
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
            {getMutationErrorMessage(
              observationQuery.error,
              "That observation could not be loaded.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void observationQuery.refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  return (
    <ObservationDetailContent
      detail={toObservationDetail(observationQuery.data.dataModel)}
    />
  );
}

export default function ObservationDetailPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
            <SkeletonDetailPage />
          </div>
        }
      >
        <ObservationDetail />
      </Suspense>
    </div>
  );
}
