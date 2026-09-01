import { Suspense } from "react";
import { ResumeIncidentDraft } from "@/components/incidents/report/ResumeIncidentDraft";

/** Reads the draft id from `?draft=`, so it needs a Suspense boundary. */
export default function ReportIncidentPage() {
  return (
    <Suspense fallback={null}>
      <ResumeIncidentDraft />
    </Suspense>
  );
}
