"use client";

import { useParams } from "next/navigation";
import { InspectionPerformContent } from "@/components/inspections/perform/InspectionPerformContent";

/**
 * Answering a scheduled inspection.
 *
 * Keyed by the run's own id — everything it renders comes from
 * `GET /inspections/{id}`: the template snapshot pinned when the inspection was
 * created, and the answers recorded so far. It deliberately never reads the live
 * template, which can have moved on since the run was scheduled.
 */
export default function InspectionPerformPage() {
  const params = useParams();
  const inspectionId = decodeURIComponent(params.id as string);

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 pt-4">
      <InspectionPerformContent inspectionId={inspectionId} />
    </div>
  );
}
