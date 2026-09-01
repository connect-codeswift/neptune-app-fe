"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Text } from "@/components/Text";
import { ReportIncidentView } from "@/components/incidents/report/ReportIncidentView";
import { useIncidentDraftQuery } from "@/hooks/use-incident-draft-queries";
import { fromDraftPayload } from "@/forms/incident-module/draft-payload";
import type { ReportStepId } from "@/forms/incident-module/index";

/**
 * The report wizard, optionally resumed from a saved draft named by `?draft=`.
 *
 * <p>Reads the search params, so its page wraps it in a Suspense boundary.</p>
 *
 * <p>The wizard is only mounted once there is something to mount it with. It
 * seeds its state from `initialForm` on first render, so rendering it while the
 * draft is still loading would give it an empty form and then have nothing to
 * apply the answers to.</p>
 */
export function ResumeIncidentDraft() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");

  const draftQuery = useIncidentDraftQuery(draftId);

  const restored = useMemo(() => {
    if (!draftQuery.data) return null;

    return fromDraftPayload(
      draftQuery.data.payload,
      draftQuery.data.payloadVersion,
    );
  }, [draftQuery.data]);

  // No draft asked for: an ordinary new report.
  if (!draftId) {
    return <ReportIncidentView />;
  }

  if (draftQuery.isPending) {
    return (
      <div className="px-3 py-8 sm:px-4">
        <Text as="p" className="text-ehs-muted-text text-sm">
          Opening your draft…
        </Text>
      </div>
    );
  }

  // Missing, someone else's, or written by a payload version this build cannot
  // read. All three end the same way: say so plainly and offer a blank report,
  // rather than silently starting a new one under the old draft's id or
  // half-restoring a form and letting it be submitted.
  if (draftQuery.isError || !draftQuery.data || !restored) {
    return (
      <div className="flex flex-col gap-3 px-3 py-8 sm:px-4">
        <Text as="p" className="text-ehs-dark-bg text-sm font-bold">
          That draft could not be opened.
        </Text>
        <Text as="p" className="text-ehs-muted-text text-sm">
          It may have been submitted or deleted. Your other drafts are
          unaffected.
        </Text>
        <Link
          href="/dashboard/incidents/report"
          className="text-ehs-normal-blue text-sm font-bold hover:underline"
        >
          Start a new report
        </Link>
      </div>
    );
  }

  return (
    <ReportIncidentView
      draftId={draftQuery.data.id}
      initialForm={restored}
      initialStep={clampStep(draftQuery.data.currentStep)}
    />
  );
}

/** The server clamps this too; this is the client not trusting a number either. */
function clampStep(step: number): ReportStepId {
  if (!Number.isFinite(step)) return 1;
  return Math.min(Math.max(Math.trunc(step), 1), 5) as ReportStepId;
}
