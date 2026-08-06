"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
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
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">
          That Walk-and-Talk session could not be found.
        </p>
        <Link
          href={WALK_TALK_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to Walk &amp; Talk
        </Link>
      </div>
    );
  }

  if (sessionQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Loading session…
        </Text>
      </div>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data?.dataModel) {
    return (
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pb-8">
        <Text as="p" className="text-ehs-red text-sm">
          {getMutationErrorMessage(
            sessionQuery.error,
            "That Walk-and-Talk session could not be loaded.",
          )}
        </Text>
        <Link
          href={WALK_TALK_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to Walk &amp; Talk
        </Link>
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
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <Suspense fallback={null}>
        <WalkTalkSessionDetail />
      </Suspense>
    </div>
  );
}
