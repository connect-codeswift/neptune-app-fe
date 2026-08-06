"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { UploadDocumentForm } from "@/components/policy-maker/upload/UploadDocumentForm";
import { UploadDocumentHeader } from "@/components/policy-maker/upload/UploadDocumentHeader";
import { toast } from "@/lib/toast";

/**
 * Upload Document screen (Figma 5568:24675).
 * Matches near-miss / document-detail shells: full-width header + centered form.
 */
export function UploadDocumentView() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs…"
        searchonleft
        dateRangeLabel="March 25 — April 24, 2026"        onDateRangeClick={() =>
          toast.success("Date range", "Date filter coming soon.")
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-5 sm:px-4 sm:pb-8">
        <UploadDocumentHeader />
        <div className="flex w-full min-w-0 justify-center">
          <UploadDocumentForm />
        </div>
      </div>
    </div>
  );
}
