"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ObservationDetailContent } from "@/components/bbs/observation/ObservationDetailContent";
import {
  getObservationDetail,
  type ObservationDetail,
} from "../bbs-data";
import { toBbsObservationApiId } from "@/hooks/use-bbs-queries";

const BBS_ROUTE = "/dashboard/bbs";

/** Placeholder so list rows (e.g. BBS-2) still mount the detail view + API call. */
function fallbackDetail(id: string): ObservationDetail {
  return {
    id,
    observer: "—",
    date: "—",
    time: "—",
    location: "—",
    category: "—",
    type: "Safe",
    observed: "—",
    photos: [],
  };
}

/** Reads the id from `?id=`, so it needs a Suspense boundary. */
function ObservationDetail() {
  const searchParams = useSearchParams();
  const id = decodeURIComponent(searchParams.get("id") ?? "");
  const detail = getObservationDetail(id) ?? (id ? fallbackDetail(id) : null);

  if (!detail || toBbsObservationApiId(detail.id) === null) {
    return (
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">
          That observation could not be found.
        </p>
        <Link
          href={BBS_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to observations
        </Link>
      </div>
    );
  }

  return <ObservationDetailContent detail={detail} />;
}

export default function ObservationDetailPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <Suspense fallback={null}>
        <ObservationDetail />
      </Suspense>
    </div>
  );
}
