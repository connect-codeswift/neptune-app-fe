"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ObservationEditContent } from "@/components/bbs/observation/ObservationEditContent";
import { toBbsObservationApiId } from "@/hooks/use-bbs-queries";

const BBS_ROUTE = "/dashboard/bbs";

/** Reads the id from `?id=`, so it needs a Suspense boundary. */
function ObservationEdit() {
  const searchParams = useSearchParams();
  const id = decodeURIComponent(searchParams.get("id") ?? "");

  if (!id || toBbsObservationApiId(id) === null) {
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

  return <ObservationEditContent observationId={id} />;
}

export default function ObservationEditPage() {
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <DashboardHeader />

      <Suspense fallback={null}>
        <ObservationEdit />
      </Suspense>
    </div>
  );
}
