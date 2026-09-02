"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { WalkTalkDetailContent } from "@/components/walk-talk/session/WalkTalkDetailContent";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  toWalkTalkSessionApiId,
  useWalkTalkSessionDetailQuery,
} from "@/hooks/use-walk-talk-queries";
import { toWalkTalkSessionDetail } from "@/lib/map-walk-talk";

const WALK_TALK_ROUTE = "/dashboard/walk-talk";

/** Reads the id from `?id=`, so it needs a Suspense boundary. */
function WalkTalkSessionDetail() {
  const searchParams = useSearchParams();
  const id = decodeURIComponent(searchParams.get("id") ?? "");
  const apiId = toWalkTalkSessionApiId(id);
  const sessionQuery = useWalkTalkSessionDetailQuery(id || null);

  if (apiId === null) {
    return (
      <div className="bg-ehs-light-bg flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-darker">
          Session not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          That Walk & Talk session could not be found.
        </Text>
        <Link
          href={WALK_TALK_ROUTE}
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to Walk & Talk
        </Link>
      </div>
    );
  }

  if (sessionQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data?.dataModel) {
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
            Could not load session
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
            {getMutationErrorMessage(
              sessionQuery.error,
              "That Walk & Talk session could not be loaded.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void sessionQuery.refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  return (
    <WalkTalkDetailContent
      detail={toWalkTalkSessionDetail(sessionQuery.data.dataModel)}
    />
  );
}

export default function WalkTalkSessionDetailPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
            <SkeletonDetailPage />
          </div>
        }
      >
        <WalkTalkSessionDetail />
      </Suspense>
    </div>
  );
}
