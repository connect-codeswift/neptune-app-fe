"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { WalkTalkDetailContent } from "@/components/walk-talk/session/WalkTalkDetailContent";
import { getWalkTalkSessionDetail } from "../walk-talk-data";

const WALK_TALK_ROUTE = "/dashboard/walk-talk";

/** Reads the id from `?id=`, so it needs a Suspense boundary. */
function WalkTalkSessionDetail() {
  const searchParams = useSearchParams();
  const id = decodeURIComponent(searchParams.get("id") ?? "");
  const detail = getWalkTalkSessionDetail(id);

  if (!detail) {
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

  return <WalkTalkDetailContent detail={detail} />;
}

export default function WalkTalkSessionDetailPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />

      <Suspense fallback={null}>
        <WalkTalkSessionDetail />
      </Suspense>
    </div>
  );
}
