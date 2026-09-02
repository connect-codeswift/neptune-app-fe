"use client";

import { UploadDocumentForm } from "@/components/policy-maker/upload/UploadDocumentForm";
import { UploadDocumentHeader } from "@/components/policy-maker/upload/UploadDocumentHeader";

/**
 * Upload Document screen (Figma 5568:24675).
 * Matches near-miss / document-detail shells: full-width header + centered form.
 */
export function UploadDocumentView() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pt-4 pb-6 sm:gap-5 sm:px-4 sm:pb-8">
        <UploadDocumentHeader />
        <div className="flex w-full min-w-0 justify-center">
          <UploadDocumentForm />
        </div>
      </div>
    </div>
  );
}
